'use client';

import { useSearchParams } from 'next/navigation';
import { useCode } from '@/lib/context/CodeContext';
import { FileContent } from '@/components/file-content';
import { useState, MouseEvent, Suspense } from 'react';

function CodeReviewContent() {
  const searchParams = useSearchParams();
  const { fetchedFiles } = useCode();
  const path = searchParams.get('path') || undefined;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const handleLineClick = (lineNumber: number, e: MouseEvent<Element>) => {
    e.preventDefault();
    setSelectedLine(lineNumber);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedLine(null);
  };

  if (!fetchedFiles || fetchedFiles.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">No Files Selected</h1>
        <p>Please go back to the code page and fetch a repository first.</p>
      </div>
    );
  }

  const selectedFile = fetchedFiles.find(file => file.path === path);
  const fileContent = selectedFile?.content || '';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Review</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Files</h2>
          <ul className="space-y-2">
            {fetchedFiles.map((file) => (
              <li key={file.path}>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('path', file.path);
                    window.history.pushState({}, '', url);
                  }}
                  className={`text-left w-full p-2 rounded ${
                    path === file.path ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  {file.path}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">File Content</h2>
          {path ? (
            <FileContent
              selectedFile={path}
              fileContent={fileContent}
              highlightedLines={[]}
              lineComments={{}}
              onLineClick={handleLineClick}
              setReview={() => {}}
              showDialog={showDialog}
              selectedLine={selectedLine}
              onCloseDialog={handleCloseDialog}
            />
          ) : (
            <p>Select a file to view its content</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodeReviewPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CodeReviewContent />
    </Suspense>
  );
}