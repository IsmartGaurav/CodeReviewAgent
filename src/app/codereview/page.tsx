'use client';

import { useSearchParams } from 'next/navigation';
import { useCode } from '@/lib/context/CodeContext';
import { useState, Suspense } from 'react';
import { ReviewClient } from "@/components/review-client";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

function CodeReviewContent() {
  const searchParams = useSearchParams();
  const { fetchedFiles } = useCode();
  const path = searchParams.get('path') || '';

  if (!fetchedFiles || fetchedFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#181825] w-full">
        <div className="bg-[#1e1e2e] p-8 rounded-lg shadow-sm border border-[#313244] max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-900/20 p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-red-400"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">No Files Selected</h1>
          <p className="text-gray-400 mb-6">Please go back to the code page and fetch a repository first.</p>
          <Button 
            asChild
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <a href="/code">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go to Repository Fetcher
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const selectedFile = fetchedFiles.find(file => file.path === path);
  const fileContent = selectedFile?.content || '';

  return (
    <div className="flex flex-col h-screen bg-[#181825]">
      <div className="flex items-center px-4 py-2 border-b border-[#313244]">
        <h1 className="text-xl font-bold text-white">Code Review AI</h1>
        <span className="ml-3 px-2 py-0.5 text-xs bg-blue-900/30 text-blue-300 rounded-full">
          {fetchedFiles.length} Files
        </span>
        <div className="ml-auto">
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="text-black border-[#313244] hover:bg-[#313244] hover:text-white"
          >
            <a href="/code">
              <ArrowLeftIcon className="h-3 w-3 mr-1" />
              Back
            </a>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ReviewClient
          files={fetchedFiles.map(f => f.path)}
          selectedFile={{ content: fileContent }}
          file={path}
        />
      </div>
    </div>
  );
}

export default function CodeReviewPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#181825] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-[#313244] rounded mb-8"></div>
          <div className="w-[90%] max-w-6xl h-[80vh] bg-[#1e1e2e] rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[#313244] h-full">
              <div className="bg-[#1e1e2e] p-4">
                <div className="h-6 bg-[#313244] rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-5 bg-[#313244] rounded"></div>
                  ))}
                </div>
              </div>
              <div className="bg-[#1e1e2e]">
                <div className="h-10 bg-[#313244]"></div>
                <div className="h-[calc(100%-2.5rem)] bg-[#252538]"></div>
              </div>
              <div className="bg-[#1e1e2e]">
                <div className="h-10 bg-[#313244]"></div>
                <div className="h-[calc(100%-2.5rem)] bg-[#252538]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CodeReviewContent />
    </Suspense>
  );
}