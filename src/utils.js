import { LowSync, JSONFileSync } from "lowdb";
import { GraphQLClient } from "graphql-request";
import { ethers } from "ethers";
import config from "./config";
import abi from "./abi";

// change sleep time in config, ms
export const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });
};

// file system setup
export function getDB() {
  const adapter = new JSONFileSync("collection.json");
  const db = new LowSync(adapter);
  await db.read();
  db.data ||= {};

  return db;
}

// querying Graph
export const graphQLClient = new GraphQLClient(config.endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
});

export const gqlQuery = (id) => {
  return gql`
  # query${id}
  `;
};

// querying EVM
const provider = ethers.providers.getDefaultProvider("homestead", {
  infura: config.infuraID,
});

export const getContract = () => new ethers.Contract(config.contractAddress, abi, provider);
