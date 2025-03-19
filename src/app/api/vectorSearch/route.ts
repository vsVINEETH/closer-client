import { OpenAIEmbeddings } from "@langchain/openai";
import mongoClientPromise from "@/app/lib/mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), { status: 400 });
    }

    const client = await mongoClientPromise;
    const dbName = "closer";
    const collection = client.db(dbName).collection("queries");

    const dbConfig = {
      collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    };

    const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings({ stripNewLines: true }), dbConfig);

    const retriever = await vectorStore.asRetriever({
      searchType: "mmr",
      searchKwargs: { fetchK: 20, lambda: 0.1 },
    });

    const retrievedResults = await retriever.invoke(question);

    return new Response(JSON.stringify(retrievedResults), { status: 200 });
  } catch (error) {
    console.error("Error processing vector search:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
