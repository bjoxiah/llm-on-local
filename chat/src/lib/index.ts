import { Conversation } from '@/models';
import useContextPipelineStore from '@/store';

// qwenSummarizeOldMessages
export const qwenSummarizeOldMessages = async (
	oldMessages: Conversation[]
): Promise<string> => {
	const prompt = `
    Summarize the following conversation in 1-5 sentences. 
    Keep all important user facts, requests, and assistant answers that might be relevant for future context.
  
    Conversation:
    ${oldMessages.map((m) => `${m.role}: ${m.content}`).join('\n')}
  
    Return ONLY the summary text — no explanations, no JSON.
    `;

	try {
		const res = await fetch('/api/summarize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		});

		const data = await res.json();
		return data || 'No summary generated.';
	} catch (err) {
		console.error('Summarization failed:', err);
		return 'Summary unavailable.';
	}
};

/**
 * Builds a full context-aware prompt for an AI model
 * using the conversation summary, history, memory, and retrieved docs.
 */
export const preparePrompt = (userQuery: string): string => {
	const store = useContextPipelineStore.getState();
	const { conversationHistory, conversationSummary, memory, retrievedDocs } =
		store;

	// --- 🧱 Build dynamic context blocks ---

	const contextSections: string[] = [];

	if (conversationSummary) {
		contextSections.push(
			`### Conversation Summary\n${conversationSummary}`
		);
	}

	if (conversationHistory.length > 0) {
		const formattedHistory = conversationHistory
			.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
			.join('\n');
		contextSections.push(`### Recent Conversation\n${formattedHistory}`);
	}

	if (Object.keys(memory).length > 0) {
		const memoryFormatted = Object.entries(memory)
			.map(([k, v]) => `- ${k}: ${v}`)
			.join('\n');
		contextSections.push(`### Memory\n${memoryFormatted}`);
	}

	if (retrievedDocs.length > 0) {
		contextSections.push(
			`### Retrieved Documents\n${retrievedDocs.join('\n')}`
		);
	}

	// --- 🧠 Combine everything into a single well-structured prompt ---
	const prompt = `
        You are an AI assistant. Use the following context — conversation history, memory, and retrieved documents — 
        to answer the user's query clearly, factually, and concisely.

        Guidelines:
        - Use the conversation summary for background context.
        - Use recent conversation for continuity.
        - Use memory for persistent user facts or preferences.
        - Use retrieved documents to ground your answer in real data.
        - If unsure, say so rather than hallucinating.
        - Always prioritize factual accuracy and relevance.
        - If unsure, say 'I don't know.' Do not make assumptions.
        

        ${contextSections.join('\n\n') || 'No prior context available.'}

        ### User Query
        ${userQuery}
  `.trim();

	return prompt;
}
