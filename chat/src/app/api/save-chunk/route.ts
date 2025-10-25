import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vector.store";
import { Document } from "langchain/document";

export async function POST(req: Request) {
  const { chunks } = await req.json();

  if (!chunks || !Array.isArray(chunks)) {
    return NextResponse.json({ error: "Invalid chunks" }, { status: 400 });
  }

  const data: Document[] = chunks.map((text: string) => new Document({ pageContent: text, metadata: {} }));

  const vectorStore = await getVectorStore()
  await vectorStore.addDocuments(data);

const docs = vectorStore.memoryVectors;
console.log("Number of docs in store:", docs.length);

  return NextResponse.json({ message: "Chunks stored successfully" });
}
