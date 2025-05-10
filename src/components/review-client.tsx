"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CodeReview } from "./code-review";
import { FileContent } from "./file-content";
import { Badge } from "./ui/badge";
import { FolderIcon, FileIcon } from "lucide-react";

export function ReviewClient({
  files,
  selectedFile,
  file: currentFile,
}: {
  files: string[];
  selectedFile: { content?: string; error?: string };
  file: string;
}) {
  const [review, setReview] = useState<string>("");
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const [lineComments, setLineComments] = useState<Record<number, string>>({});
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Reset review state when file changes
    setReview("");
    setHighlightedLines([]);
    setLineComments({});
    setSelectedLine(null);
    setShowDialog(false);
  }, [currentFile]);

  useEffect(() => {
    if (review) {
      const lines = new Set<number>();
      const comments: Record<number, string> = {};

      // Patterns to match line numbers in the review
      const lineNumberPatterns = [
        /Line\s+(\d+)-(\d+):/g, // Matches "Line 1-5:"
        /Line\s+(\d+):/g, // Matches "Line 1:"
        /^\s*(\d+)\.\s+/gm, // Matches "1. " at start of line
        /^\s*(\d+)\)\s+/gm, // Matches "1) " at start of line
        /^\s*(\d+)\s+/gm, // Matches "1 " at start of line
        /line\s+(\d+)/gi, // Matches "line 1" (case insensitive)
        /lines?\s+(\d+)(?:\s*-\s*(\d+))?/gi, // Matches "line 1" or "lines 1-5"
      ];

      for (const pattern of lineNumberPatterns) {
        let match;
        while ((match = pattern.exec(review)) !== null) {
          if (match[1] && match[2]) {
            // Handle line ranges (e.g., "lines 1-5")
            const startLine = parseInt(match[1]);
            const endLine = parseInt(match[2]);
            if (!isNaN(startLine) && !isNaN(endLine)) {
              for (let i = startLine; i <= endLine; i++) {
                lines.add(i);
                // Extract the comment text after the line number
                const commentStart = match.index + match[0].length;
                const nextSectionMatch = review
                  .slice(commentStart)
                  .match(
                    /^[^\n]+(?:\n(?!\d+\.|\d+\)|\d+\s|Line\s+\d|line\s+\d)[^\n]*)*/
                  );
                if (nextSectionMatch) {
                  comments[i] = nextSectionMatch[0].trim();
                }
              }
            }
          } else if (match[1]) {
            // Handle single line (e.g., "line 1")
            const lineNumber = parseInt(match[1]);
            if (!isNaN(lineNumber)) {
              lines.add(lineNumber);
              const commentStart = match.index + match[0].length;
              const nextSectionMatch = review
                .slice(commentStart)
                .match(
                  /^[^\n]+(?:\n(?!\d+\.|\d+\)|\d+\s|Line\s+\d|line\s+\d)[^\n]*)*/
                );
              if (nextSectionMatch) {
                comments[lineNumber] = nextSectionMatch[0].trim();
              }
            }
          }
        }
      }

      setHighlightedLines(Array.from(lines).sort((a, b) => a - b));
      setLineComments(comments);
    }
  }, [review]);

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedLine(null);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-3.5rem)] w-full">
      {/* Project Files Panel - 1/3 of space */}
      <ResizablePanel defaultSize={33.3} minSize={20}>
        <Card className="h-full rounded-none border-0 shadow-none bg-[#1e1e2e]">
          <CardHeader className="border-b border-[#313244] bg-[#1e1e2e]">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-yellow-400" />
              <span>Project Files</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Select a file to review for code analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 bg-[#1e1e2e]">
            <ScrollArea className="h-[calc(100vh-8rem)] pb-4">
              <div className="px-3 py-2">
                {files.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Loading files...</p>
                ) : (
                  <div className="space-y-1">
                    {files.map((file) => (
                      <Link
                        href={`?path=${file}`}
                        key={file}
                        className={`block px-3 py-2 rounded cursor-pointer transition-colors ${
                          file === currentFile 
                            ? 'bg-[#313244] hover:bg-[#313244]' 
                            : 'hover:bg-[#28283c]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                            <span
                              className={cn(
                                "font-mono text-xs truncate max-w-[170px]",
                                file === currentFile 
                                  ? "text-blue-300 font-medium" 
                                  : "text-gray-300"
                              )}
                            >
                              {file}
                            </span>
                          </div>
                          {file === currentFile && (
                            <Badge className="bg-blue-900/50 text-blue-300 hover:bg-blue-800/60 text-[10px] px-1.5 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </ResizablePanel>
      
      <ResizableHandle className="bg-[#313244] w-[1px]" withHandle />
      
      {/* File Content Panel - 1/3 of space */}
      <ResizablePanel defaultSize={33.3} minSize={30}>
        <FileContent
          selectedFile={currentFile}
          fileContent={selectedFile.content || ""}
          highlightedLines={highlightedLines}
          lineComments={lineComments}
          onLineClick={handleLineClick}
          setReview={setReview}
          showDialog={showDialog}
          selectedLine={selectedLine}
          onCloseDialog={handleCloseDialog}
        />
      </ResizablePanel>
      
      <ResizableHandle className="bg-[#313244] w-[1px]" withHandle />
      
      {/* Code Review Panel - 1/3 of space */}
      <ResizablePanel defaultSize={33.3} minSize={20}>
        <CodeReview review={review} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
