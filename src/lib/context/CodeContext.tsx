'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FileData {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
}

interface CodeContextType {
  fetchedFiles: FileData[];
  setFetchedFiles: (files: FileData[]) => void;
  selectedSource: 'local' | 'fetched';
  setSelectedSource: (source: 'local' | 'fetched') => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export function CodeProvider({ children }: { children: ReactNode }) {
  const [fetchedFiles, setFetchedFiles] = useState<FileData[]>([]);
  const [selectedSource, setSelectedSource] = useState<'local' | 'fetched'>('local');

  return (
    <CodeContext.Provider value={{
      fetchedFiles,
      setFetchedFiles,
      selectedSource,
      setSelectedSource,
    }}>
      {children}
    </CodeContext.Provider>
  );
}

export function useCode() {
  const context = useContext(CodeContext);
  if (context === undefined) {
    throw new Error('useCode must be used within a CodeProvider');
  }
  return context;
} 