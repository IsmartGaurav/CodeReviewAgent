'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  clearSavedData: () => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

const STORAGE_KEY = 'code-review-data';

export function CodeProvider({ children }: { children: ReactNode }) {
  const [fetchedFiles, setFetchedFilesState] = useState<FileData[]>([]);
  const [selectedSource, setSelectedSource] = useState<'local' | 'fetched'>('local');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFetchedFilesState(parsedData.fetchedFiles || []);
          setSelectedSource(parsedData.selectedSource || 'local');
        }
      } catch (error) {
        console.error('Error loading saved code data:', error);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            fetchedFiles,
            selectedSource,
          })
        );
      } catch (error) {
        console.error('Error saving code data:', error);
      }
    }
  }, [fetchedFiles, selectedSource, isInitialized]);

  const setFetchedFiles = (files: FileData[]) => {
    setFetchedFilesState(files);
  };

  const clearSavedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setFetchedFilesState([]);
      setSelectedSource('local');
    }
  };

  return (
    <CodeContext.Provider value={{
      fetchedFiles,
      setFetchedFiles,
      selectedSource,
      setSelectedSource,
      clearSavedData,
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