'use client';
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

export const ChatComponent = () => {
	const [messages, setMessages] = useState([
		{ id: 1, sender: 'ai', text: 'Hello! How can I help you today?' },
	]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const isNearBottom =
			container.scrollHeight -
				container.scrollTop -
				container.clientHeight <
			50;

		if (isNearBottom) {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: 'smooth',
			});
		}
	}, [messages]);

	const sendMessage = async () => {
		if (!input.trim() || loading) return;

		const userMsg = { id: Date.now(), sender: 'user', text: input };
		const aiMsgId = Date.now() + 1;

		setMessages((prev) => [
			...prev,
			userMsg,
			{ id: aiMsgId, sender: 'ai', text: '' },
		]);
		setInput('');
		setLoading(true);

		abortRef.current = new AbortController();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				body: JSON.stringify({ message: userMsg.text }),
				signal: abortRef.current.signal,
			});

			if (!res.body) throw new Error('No response body');

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let aiText = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk
					.split('\n')
					.filter((line) => line.trim() !== '');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.replace('data: ', '');
						if (data === '[DONE]') break;

						aiText += data;
						setMessages((prev) =>
							prev.map((m) =>
								m.id === aiMsgId ? { ...m, text: aiText } : m
							)
						);
					}
				}
			}
		} catch (err) {
			console.error('Streaming error:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full bg-[#343541] text-gray-200">
			{/* Messages */}
			<div ref={containerRef} className="flex-1 overflow-y-auto w-full px-4 py-4 space-y-4">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex items-start max-w-3xl mx-auto ${
							msg.sender === 'user'
								? 'justify-end'
								: 'justify-start'
						}`}
					>
						{msg.sender === 'ai' ? (
							<div className="w-8 h-8 flex-shrink-0 rounded-sm bg-[#565869] flex items-center justify-center text-white mr-3">
								<FaRobot size={16} />
							</div>
						) : (
							<div className="w-8 h-8 flex-shrink-0 mr-3" />
						)}

						<div
							className={`px-4 py-2 rounded-md max-w-full break-words whitespace-pre-wrap ${
								msg.sender === 'ai'
									? 'bg-[#444654] text-gray-200'
									: 'bg-[#40414f] border border-[#565869] text-gray-200'
							}`}
						>
							{msg.text}
						</div>
					</div>
				))}

				{loading && (
					<div className="flex items-start max-w-3xl mx-auto">
						<div className="w-8 h-8 rounded-sm bg-[#565869] flex items-center justify-center text-white mr-3">
							<FaRobot size={16} />
						</div>
						<div className="bg-[#444654] px-4 py-2 rounded-md text-gray-400">
							AI is typing...
						</div>
					</div>
				)}
			</div>

			{/* Input */}
			<div className="bg-[#343541] border-t border-gray-700 p-4">
				<div className="max-w-3xl mx-auto flex items-center gap-2 w-full">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
						placeholder="Send a message..."
						className="flex-1 p-3 rounded-md border border-gray-700 bg-[#40414f] text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-400"
					/>
					<button
						onClick={sendMessage}
						className="p-3 bg-transparent text-gray-400 hover:text-gray-200"
						disabled={loading}
					>
						<FaPaperPlane size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};
