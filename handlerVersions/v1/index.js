const { MongoClient } = require("mongodb");
console.log("Logics is running");
// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "myProject";

var db;
var collection;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  db = client.db(dbName);
  collection = db.collection("documents");

  // the following code examples can be pasted here...

  return "done.";
}

// main()
//   .then(console.log)
//   .catch(console.error)
//   .finally(() => client.close());

function parseTokenString(tokenString) {
  const [amountString, symbol] = tokenString.split(" ");
  const amount = parseFloat(amountString);
  return { amount, symbol };
}

async function updateTransferData(state, payload, blockInfo, context) {
  // await main();
  console.log("Data from payload", payload.data);

  // await collection.insertOne({ data: payload.data });
  // await client.close();
  const { amount, symbol } = parseTokenString(payload.data.quantity);
  if (!state.volumeBySymbol[symbol]) {
    state.volumeBySymbol[symbol] = amount;
  } else {
    state.volumeBySymbol[symbol] += amount;
  }
  state.totalTransfers += 1;
  context.stateCopy = JSON.parse(JSON.stringify(state)); // Deep copy state to de-reference
}

const updaters = [
  {
    actionType: "alaio.token::transfer",
    apply: updateTransferData,
  },
];

function logUpdate(payload, blockInfo, context) {
  console.info("State updated:\n", JSON.stringify(context.stateCopy, null, 2));
}

const effects = [
  {
    actionType: "alaio.token::transfer",
    run: logUpdate,
  },
];

const handlerVersion = {
  versionName: "v1",
  updaters,
  effects,
};

module.exports = handlerVersion;
