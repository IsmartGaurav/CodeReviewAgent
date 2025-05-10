'use client';

import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { useRouter } from 'next/navigation';
import { useCode } from '@/lib/context/CodeContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, ArrowRight, XCircle, Loader2 } from "lucide-react";

interface FileData {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
}

const IGNORED_FILES = [
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.eslintrc',
  'tsconfig.json',
  'next.config.js',
  'postcss.config.js',
  'tailwind.config.js',
  'node_modules',
  '.git',
  '.next',
];

const IGNORED_FOLDERS = [
  'images',
  'img',
  'assets',
  'media',
  'public',
  'static',
  'dist',
  'build',
];

const ALLOWED_EXTENSIONS = [
  // Code files
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass',
  '.json', '.md', '.txt', '.xml', '.yaml', '.yml',
  // Configuration
  '.env', '.env.example', '.env.local',
  // Other text files
  '.sh', '.bash', '.zsh', '.ps1', '.bat',
];

export default function CodeFetcher() {
  const router = useRouter();
  const { setFetchedFiles, fetchedFiles, clearSavedData } = useCode();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // Check if we have cached data on mount
  useEffect(() => {
    if (fetchedFiles.length > 0) {
      setIsComplete(true);
      setLoadedFromCache(true);
    }
  }, [fetchedFiles]);

  const handleClearData = () => {
    clearSavedData();
    setIsComplete(false);
    setLoadedFromCache(false);
    setProgress([]);
    setRepoUrl('');
  };

  const shouldIgnoreFile = (name: string, path: string): boolean => {
    // Check if file is in the ignored list
    if (IGNORED_FILES.includes(name)) return true;

    // Check if file is in an ignored folder
    const pathParts = path.split('/');
    if (pathParts.some(part => IGNORED_FOLDERS.includes(part.toLowerCase()))) {
      return true;
    }

    // Get file extension
    const extension = name.toLowerCase().split('.').pop() || '';
    const fullExtension = `.${extension}`;

    // If file has no extension, allow it (could be a config file)
    if (!extension) {
      return false;
    }

    // If file has an allowed extension, keep it
    if (ALLOWED_EXTENSIONS.includes(fullExtension)) {
      return false;
    }

    // Skip all other files
    return true;
  };

  const fetchFileContent = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string
  ): Promise<string> => {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString();
      }
      return '';
    } catch (error) {
      console.error(`Error fetching content for ${path}:`, error);
      return '';
    }
  };

  const fetchRepoContents = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string = '',
    files: FileData[] = []
  ): Promise<FileData[]> => {
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(contents)) {
        for (const item of contents) {
          const fullPath = path ? `${path}/${item.name}` : item.name;
          
          // Skip if file should be ignored
          if (shouldIgnoreFile(item.name, fullPath)) {
            setProgress(prev => [...prev, `Skipping ignored file/folder: ${fullPath}`]);
            continue;
          }
          
          if (item.type === 'dir') {
            setProgress(prev => [...prev, `Fetching directory: ${fullPath}`]);
            const subFiles = await fetchRepoContents(octokit, owner, repo, fullPath, files);
            files.push(...subFiles);
          } else {
            setProgress(prev => [...prev, `Fetching file: ${fullPath}`]);
            const content = await fetchFileContent(octokit, owner, repo, fullPath);
            files.push({
              name: item.name,
              path: fullPath,
              content,
              type: 'file',
            });
          }
        }
      }
      return files;
    } catch (err) {
      console.error('Error fetching contents:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProgress([]);
    setIsComplete(false);

    try {
      const urlParts = repoUrl.split('github.com/')[1]?.split('/');
      if (!urlParts || urlParts.length < 2) {
        throw new Error('Invalid GitHub repository URL');
      }

      const [owner, repo] = urlParts;
      const octokit = new Octokit();

      const files = await fetchRepoContents(octokit, owner, repo);
      setFetchedFiles(files);
      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = () => {
    router.push('/codereview');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#181825] text-white">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Code Repository Fetcher</h1>
          <p className="text-gray-400">Fetch a GitHub repository to analyze and review its code</p>
        </div>
        
        {loadedFromCache && (
          <Card className="mb-6 bg-[#1e1e2e] border border-[#313244]">
            <CardContent className="flex justify-between items-center p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-200">Repository loaded from saved data.</span>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleClearData}
                  variant="outline"
                  className="border-[#313244] hover:bg-[#313244] text-red-400 hover:text-red-300"
                >
                  Clear Data
                </Button>
                <Button
                  onClick={handleReview}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <span>Go to Code Review</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-[#1e1e2e] border border-[#313244]">
          <CardHeader>
            <CardTitle>Repository URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-[#252538] border-[#313244] text-white"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-blue-100/70"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fetching...
                  </span>
                ) : (
                  'Fetch Repository'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-4 bg-red-900/20 border border-red-800">
            <CardContent className="p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <span className="text-red-300">{error}</span>
            </CardContent>
          </Card>
        )}

        {isLoading && !progress.length && (
          <Card className="mt-4 bg-[#1e1e2e] border border-[#313244]">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-[#313244] rounded w-3/4"></div>
                <div className="h-4 bg-[#313244] rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {progress.length > 0 && (
          <Card className="mt-6 bg-[#1e1e2e] border border-[#313244]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Progress</CardTitle>
                <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                  {progress.length} Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[250px] rounded-md">
                <div className="space-y-1 pr-4">
                  {progress.map((item, index) => (
                    <div key={index} className="p-2 text-sm bg-[#252538] rounded-md">
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {isComplete && !loadedFromCache && (
          <Card className="mt-6 bg-green-900/20 border border-green-800">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-300">Repository fetched successfully!</span>
              </div>
              <Button
                onClick={handleReview}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <span>Go to Code Review</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 