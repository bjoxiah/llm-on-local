import { Ollama } from 'ollama';

export const runtime = 'nodejs'; // ensure not edge

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      try {
        const ollama = new Ollama({
          host: process.env.OLLAMA_API_URL || 'http://ollama-runtime:11434',
        });

        // Stream chat messages
        const response = await ollama.chat({
          model: 'qwen',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        for await (const chunk of response) {
          if (chunk.message?.content) {
            controller.enqueue(encoder.encode(`data: ${chunk.message.content}\n\n`));
          }
        }

        // ✅ End of stream
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        console.error('Ollama streaming error:', err);

        // Only notify the client, don’t send the raw error object
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
