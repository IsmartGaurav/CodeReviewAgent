'use client';

import { ReviewClient } from "@/components/review-client";
import { useCode } from "@/lib/context/CodeContext";
import { useState, useEffect } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: { path?: string };
}) {
  const path = searchParams?.path || '';
  const { fetchedFiles, selectedSource, setSelectedSource } = useCode();
  const [localFiles, setLocalFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ content?: string; error?: string }>({});

  useEffect(() => {
    const loadLocalFiles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        setLocalFiles(data.files || []);
      } catch (error) {
        console.error('Error loading local files:', error);
        setLocalFiles([]);
      }
    };
    loadLocalFiles();
  }, []);

  useEffect(() => {
    const loadFileContent = async () => {
      if (!path) return;

      if (selectedSource === 'local') {
        try {
          const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
          const data = await response.json();
          setSelectedFile(data);
        } catch (error) {
          console.error('Error loading file content:', error);
          setSelectedFile({ error: 'Failed to load file content' });
        }
      } else {
        // For fetched files, we already have the content in the context
        const file = fetchedFiles.find(f => f.path === path);
        setSelectedFile({ content: file?.content });
      }
    };
    loadFileContent();
  }, [path, selectedSource, fetchedFiles]);

  const files = selectedSource === 'local' ? localFiles : fetchedFiles.map(f => f.path);

  return (
    <div className='container mx-auto p-4'>
      <header className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Code Review AI Agent</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedSource('local')}
            className={`px-4 py-2 rounded-md ${
              selectedSource === 'local'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Local Codebase
          </button>
          <button
            onClick={() => setSelectedSource('fetched')}
            className={`px-4 py-2 rounded-md ${
              selectedSource === 'fetched'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Fetched Repository
          </button>
        </div>
      </header>

      <div className='page-container'>
        <h2 className='text-xl font-bold mb-4'>
          Hi! I&apos;m Code Review Agent, your personal code review AI agent.
        </h2>
        <p className='mb-6'>
          I&apos;m here to help you review your code. I&apos;ll give you a
          detailed analysis of the code, including security vulnerabilities,
          code style, and performance optimizations.
        </p>
        <ReviewClient
          files={files}
          selectedFile={selectedFile}
          file={path}
        />
      </div>
    </div>
  );
}