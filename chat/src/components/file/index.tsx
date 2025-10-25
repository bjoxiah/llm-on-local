'use client';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { useRef } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import useContextPipelineStore from '@/store';

export const FileButtonComponent = () => {
	const { setFileLoader, setFileName, fileLoader, loader } =
		useContextPipelineStore();
	const fileRef = useRef<HTMLInputElement | null>(null);
    // Chunking
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 800,
		chunkOverlap: 100,
	});

	const onFileClicked = () => {
		fileRef.current?.click();
		console.log('File upload is currently disabled.');
	};

	const onFileUploaded = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			setFileName(files[0].name);
			setFileLoader(true);
			const arrayBuffer = await files[0].arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
				.promise;

			let fullText = '';
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				const strings = content.items.map((item: any) => item.str);
				fullText += strings.join(' ') + '\n';
			}

			const chunks = await splitter.splitText(fullText);

			// Send chunks to the server to embed and store
			await fetch('/api/save-chunk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chunks }),
			});
		} catch (error) {
            console.log(error)
		} finally {
			e.target.value = '';
			setFileLoader(false);
		}
	};

	return (
		<>
			<input
				ref={fileRef}
				type="file"
				className="hidden"
				onChange={onFileUploaded}
				accept="application/pdf"
			/>
			<button
				onClick={onFileClicked}
				className="p-3 bg-transparent text-gray-400 hover:text-gray-200 cursor-pointer"
				disabled={fileLoader || loader}
			>
				<FaFileCirclePlus size={18} />
			</button>
		</>
	);
};
