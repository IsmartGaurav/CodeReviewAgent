'use client';

import { useState } from 'react';
import { Octokit } from '@octokit/rest';
import { useRouter } from 'next/navigation';
import { useCode } from '@/lib/context/CodeContext';

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

const IGNORED_EXTENSIONS = [
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp', '.bmp', '.tiff',
  // Media
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv',
  '.mp3', '.wav', '.ogg', '.m4a', '.aac',
  // Archives
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // Fonts
  '.ttf', '.woff', '.woff2', '.eot', '.otf',
  // Other binary files
  '.exe', '.dll', '.so', '.dylib',
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
  const { setFetchedFiles } = useCode();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">GitHub Repository Fetcher</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium mb-2">
            Repository URL
          </label>
          <input
            type="text"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Fetching...' : 'Fetch Repository'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {progress.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Progress:</h2>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {progress.map((item, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded-md text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isComplete && (
        <div className="mt-6">
          <button
            onClick={handleReview}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Go to Code Review
          </button>
        </div>
      )}
    </div>
  );
} 