import { Ollama } from 'ollama';

export const runtime = 'nodejs'; // ensure not edge

export async function POST(req: Request) {
	const { message } = await req.json();

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		start: async (controller) => {
			try {
				const ollama = new Ollama({
					host: process.env.OLLAMA_API_URL || 'http://ollama-runtime:11434',
				});
				const response = await ollama.chat({
					model: 'qwen',
					messages: [
						{   
                            role: 'user', 
                            content: message 
                        },
					],
					stream: true,
				});

				for await (const chunk of response) {
					if (chunk.message?.content) {
						controller.enqueue(
							encoder.encode(`data: ${chunk.message.content}\n\n`)
						);
					}
				}

				controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
				controller.close();
			} catch (err) {
                console.log(err)
				controller.enqueue(encoder.encode(`data: [ERROR]\n\n`));
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
}
