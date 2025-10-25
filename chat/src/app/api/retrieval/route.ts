import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vector.store";

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const vectorStore = await getVectorStore()

  const retriever = vectorStore.asRetriever(2);
  const docs = await retriever.invoke(query);

  return NextResponse.json({ docs });
}
