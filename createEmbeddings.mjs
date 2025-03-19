import { promises as fsp } from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import "dotenv/config";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.local" });

const client = new MongoClient('mongodb+srv://vineethvs1927:6TRgQ75lvH67BV32@cluster0.wtkmo.mongodb.net/closer?retryWrites=true&w=majority&appName=Cluster0' || process.env.MONGO_URI_ATLAS|| "");
const dbName = "closer";
const collectionName = "queries";
const collection = client.db(dbName).collection(collectionName);

const docs_dir = "docs";
const fileNames = await fsp.readdir(docs_dir);
console.log(fileNames);
for (const fileName of fileNames) {
  const document = await fsp.readFile(`${docs_dir}/${fileName}`, "utf8");
  console.log(`Vectorizing ${fileName}`);
  
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const output = await splitter.createDocuments([document]);
  
  await MongoDBAtlasVectorSearch.fromDocuments(
    output,
    new OpenAIEmbeddings(),
    {
      collection,
      indexName: "default",
      textKey: "text",
      embeddingKey: "embedding",
    }
  );
}

console.log("Done: Closing Connection");
await client.close();