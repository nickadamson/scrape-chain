import axios from "axios";
import { ethers } from "ethers";
import { sleep, getDB, getContract } from "./utils";
import config from "./config";
import abi from "./abi";

// collection.json
const db = getDB();
async function saveData(data) {
  const parsed = parseData(data);

  db.data.push(parsed);

  // save file
  await db.write();
}

async function getData(id) {
  const contract = getContract();
  let dataURI = await contract.tokenURI(id);
  let metadataURI = await contract.tokenMetadataURI(id);

  const data = await axios.get(dataURI, {
    timeout: config.pollingInterval,
  }).data;
  const metadata = await axios.get(metadataURI, {
    timeout: config.pollingInterval,
  }).data;

  return { data, ...metadata };
}

async function rateLimited(id) {
  let success = false;
  let i = 1;

  while (!success) {
    // delay gets longer every time it fails
    await sleep(config.pollingInterval * i);

    try {
      const data = await getData(id);
      if (data) {
        success = true;
        return data;
      }
    } catch (error) {
      i++;
      console.log(`:( x${i}`);
    }
  }
}

function parseData(unparsed) {
  // modify here
  const parsed = unparsed;
  // modify here

  return parsed;
}

async function run() {
  // for (let id = 0; id <= 10000; id++) {
  for (let id = 1; id <= 10000; id++) {
    console.info(`Syncing #${id}...`);

    try {
      const data = await getData(id);
      saveData(data);

      console.info(`Successfully saved #${id}!`);

      await sleep(config.pollingInterval);
    } catch (error) {
      console.error(`Failed to fetch #${id}\nWaiting to try again...`);

      const data = await rateLimited(id);

      saveData(data);

      console.info(`Successfully saved #${id} after initial failure!`);
    }
  }

  console.info(`Scrape is complete!`);
}

run();
