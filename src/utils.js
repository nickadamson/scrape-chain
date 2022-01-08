import { createRequire } from "module";
import { LowSync, JSONFileSync } from "lowdb";
import { gql, GraphQLClient } from "graphql-request";
import { ethers } from "ethers";

const require = createRequire(import.meta.url);
const config = require("./config.json");
const abi = require("./abi.json");

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
  const adapter = new JSONFileSync("./src/collection.json");
  const db = new LowSync(adapter);
  db.read();
  db.data ||= { ids: [] };

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
