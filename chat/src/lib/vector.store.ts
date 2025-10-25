import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

let store: MemoryVectorStore | null = null;

// created as a singleton to prevent multiple instances of the vector store 
// since we are using in-memory storage
export const getVectorStore = async () => {
  if (!store) {
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: process.env.OLLAMA_API_URL || "http://ollama-runtime:11434",
    });

    store = new MemoryVectorStore(embeddings);
  }

  return store;
}
