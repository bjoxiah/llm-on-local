import { Ollama } from 'ollama';

export const runtime = 'nodejs'; // ensure not edge

export async function POST(req: Request) {
	const { prompt } = await req.json();
	
	try {
        const ollama = new Ollama({
            host: process.env.OLLAMA_API_URL || 'http://ollama-runtime:11434',
        });
        const response = await ollama.chat({
            model: 'qwen',
            messages: [
                {   
                    role: 'user', 
                    content: prompt 
                },
            ],
            stream: false,
        });
        return Response.json(response.message.content);
    } catch (err) {
        // console.error(err)
       return Response.json({ error: 'Summarization failed', details: err }, { status: 500 });
    }
}
