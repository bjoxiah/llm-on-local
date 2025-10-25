import { Ollama } from 'ollama';

export const runtime = 'nodejs'; // ensure not edge

export async function POST(req: Request) {
	const { texts } = await req.json();

    const ollama = new Ollama({
        host: process.env.OLLAMA_API_URL || 'http://ollama-runtime:11434',
    });

	try {
		const results = await Promise.all(
            texts.map(async (text: string) => {
              const res = ollama.embeddings({
                model: 'nomic-embed-text',
                prompt: text,
              })
              return (await res).embedding
            })
          )
    
          return Response.json(results);
	} catch (err) {
		// console.error(err)
		return Response.json(
			{ error: 'Embedding failed', details: err },
			{ status: 500 }
		);
	}
}
