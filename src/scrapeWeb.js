import { createRequire } from "module";
import axios from "axios";
import { sleep, getDB, graphQLClient, gqlQuery } from "./utils.js";

const require = createRequire(import.meta.url);
const config = require("./config.json");
const abi = require("./abi.json");

// collection.json
const db = getDB();

async function saveData(data) {
  const parsed = parseData(data);

  db.data.push(...parsed);

  // save file
  db.write();
}

async function getData(id) {
  // fetch from IPFS
  // const url = `${config.baseURL}/${id}`;
  // const { data } = await axios.get(url, {
  //   timeout: config.pollingInterval,
  // });

  // or fetch from graph
  const query = gqlQuery(id);
  const data = await graphQLClient.request(query);

  return data;
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
  for (let idx = 0; idx <= 100000; idx += 1000) {
    console.info(`Syncing #${idx + 1}-${idx + 1000}...`);

    try {
      const data = await getData(idx);
      saveData(data);

      console.info(`Successfully saved!`);

      await sleep(config.pollingInterval);
    } catch (error) {
      console.error(`Failed to fetch; Error: ${JSON.stringify(error)}\nWaiting to try again...`);

      const data = await rateLimited(idx);

      saveData(data);

      console.info(`Successfully saved #${idx}-${idx + 1000} after initial failure!`);
    }
  }

  console.info(`Scrape is complete!`);
}

run();
