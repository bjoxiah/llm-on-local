'use client';
import { preparePrompt } from '@/lib';
import { Conversation } from '@/models';
import useContextPipelineStore from '@/store';
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaFileAlt, FaSpinner } from 'react-icons/fa';
import { FileButtonComponent } from '../file';
import { FaCircleXmark } from 'react-icons/fa6';

type Message = Conversation & { id: number };

export const ChatComponent = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			role: 'assistant',
			content: 'Hello! How can I help you today?',
		},
	]);
	const [input, setInput] = useState('');
	const abortRef = useRef<AbortController | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { addMessage, fileLoader, fileName, setFileLoader, setFileName, loader, setLoader, addRetrievedDoc } = useContextPipelineStore();

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
		if (!input.trim() || loader) return;

		// Retriever pattern for LLMs
		if (fileName) {
			const retrieval = await fetch("/api/retrieval", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: input }),
			});
			const data = await retrieval.json();
			// save to the store
			addRetrievedDoc(data.docs.map((doc: {pageContent: string, metaData: object}) => doc.pageContent).join("\n"));
		}

		const userMsg: Message = {
			id: Date.now(),
			role: 'user',
			content: input,
		};
		const aiMsgId = Date.now() + 1;

		const placeholder = { role: 'assistant', content: '' };

		setMessages((prev) => [
			...prev,
			userMsg,
			{ id: aiMsgId, ...placeholder },
		]);
		setInput('');
		setLoader(true);

		abortRef.current = new AbortController();

		const prompt = preparePrompt(input);

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				body: JSON.stringify({ prompt }),
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
								m.id === aiMsgId ? { ...m, content: aiText } : m
							)
						);
					}
				}
			}
			// insert 1 turn
			addMessage([
				{ role: 'user', content: input },
				{ role: 'assistant', content: aiText },
			]);

			setFileName('');
		} catch (err) {
			console.error('Streaming error:', err);
		} finally {
			setLoader(false);
		}
	};

	const handleCancelFile = () => {
		setFileName('');
		setFileLoader(false);
	};

	return (
		<div className="flex flex-col h-full bg-[#343541] text-gray-200">
			{/* Messages */}
			<div
				ref={containerRef}
				className="flex-1 overflow-y-auto w-full px-4 py-4 space-y-4"
			>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex items-start max-w-3xl mx-auto ${
							msg.role === 'user'
								? 'justify-end'
								: 'justify-start'
						}`}
					>
						{msg.role === 'assistant' ? (
							<div className="w-8 h-8 flex-shrink-0 rounded-sm bg-[#565869] flex items-center justify-center text-white mr-3">
								<FaRobot size={16} />
							</div>
						) : (
							<div className="w-8 h-8 flex-shrink-0 mr-3" />
						)}

						<div
							className={`px-4 py-2 rounded-md max-w-full break-words whitespace-pre-wrap ${
								msg.role === 'assistant'
									? 'bg-[#444654] text-gray-200'
									: 'bg-[#40414f] border border-[#565869] text-gray-200'
							}`}
						>
							{msg.content}
						</div>
					</div>
				))}

				{loader && (
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
				{fileName && (
					<div className="w-full max-w-3xl mx-auto mb-3">
						<div className="relative flex items-center gap-3 border border-gray-600 rounded-md bg-[#2b2c34] px-3 py-2 shadow-sm">
							{/* File icon or loader */}
							<div className="flex items-center justify-center w-10 h-10 bg-purple-200 rounded-md shrink-0">
								{fileLoader ? (
									<FaSpinner
										className="animate-spin text-black"
										size={18}
									/>
								) : (
									<FaFileAlt
										className="text-black"
										size={16}
									/>
								)}
							</div>

							{/* File name */}
							<p className="text-gray-300 text-sm truncate flex-1">
								{fileName}
							</p>

							{/* Cancel / remove button */}
							<button
								onClick={handleCancelFile} // optional handler
								className="absolute -top-2 -right-2 p-1 bg-[#1e1f29] rounded-full hover:bg-red-500 hover:text-white transition cursor-pointer"
								disabled={fileLoader || loader}
							>
								<FaCircleXmark
									size={14}
									className="text-red-400"
								/>
							</button>
						</div>
					</div>
				)}

				<div className="max-w-3xl mx-auto flex items-center gap-2 w-full">
					<FileButtonComponent />
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
						className="p-3 bg-transparent text-gray-400 hover:text-gray-200 cursor-pointer"
						disabled={fileLoader || loader}
					>
						<FaPaperPlane size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};
