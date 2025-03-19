import { MongoClient } from "mongodb";
import "dotenv/config";
import { configDotenv } from "dotenv";
configDotenv({ path: ".env.local" });

const mongoUri = process.env.MONGO_URI_ATLAS || 'mongodb+srv://vineethvs1927:6TRgQ75lvH67BV32@cluster0.wtkmo.mongodb.net/closer?retryWrites=true&w=majority&appName=Cluster0';
if (!mongoUri) {
  throw new Error("MONGO_URI_ATLAS is not set. Check your environment variables.");
}
//const client = new MongoClient(mongoUri);

const uri = process.env.MONGO_URI_ATLAS as string; // Ensure you have this in .env
const options = {};

let client: MongoClient;
//let mongoClientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(mongoUri, options);
  global._mongoClientPromise = client.connect();
}

const mongoClientPromise: Promise<MongoClient> = global._mongoClientPromise;

export default mongoClientPromise;
