import { MongoClient } from "mongodb";
import "dotenv/config";
import { configDotenv } from "dotenv";
configDotenv({ path: ".env.local" });

const uri = process.env.MONGO_URI_ATLAS as string; // Ensure you have this in .env
const options = {};

let client: MongoClient;
let mongoClientPromise: Promise<MongoClient>;


declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Use global cache in development to prevent multiple instances
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

mongoClientPromise = global._mongoClientPromise;

export default mongoClientPromise;
