import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { EyeIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FileContentProps {
  selectedFile: string;
  fileContent: string;
  highlightedLines: number[];
  lineComments: Record<number, string>;
  onLineClick: (lineNumber: number, e: React.MouseEvent) => void;
  setReview: (review: string) => void;
  showDialog: boolean;
  selectedLine: number | null;
  onCloseDialog: () => void;
}

export function FileContent({
  selectedFile,
  fileContent,
  highlightedLines,
  lineComments,
  onLineClick,
  setReview,
  showDialog,
  selectedLine,
  onCloseDialog,
}: FileContentProps) {
  const [isReviewing, setIsReviewing] = useState(false);

  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "css":
        return "css";
      case "html":
        return "html";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "java":
        return "java";
      case "php":
        return "php";
      case "rb":
        return "ruby";
      case "go":
        return "go";
      case "rust":
      case "rs":
        return "rust";
      default:
        return "text";
    }
  };

  // Define line props with proper types
  const lineProps = (lineNumber: number): React.HTMLProps<HTMLElement> => {
    const isHighlighted = highlightedLines.includes(lineNumber);
    const comment = lineComments[lineNumber];

    return {
      style: {
        display: "block",
        backgroundColor: isHighlighted
          ? "rgba(255, 217, 0, 0.2)"
          : undefined,
        borderLeft: isHighlighted ? "3px solid #ffd700" : "none",
        paddingLeft: isHighlighted ? "5px" : "0",
        transition: "background-color 0.2s ease",
        cursor: isHighlighted && comment ? "pointer" : "default",
        borderRadius: "2px",
        margin: "1px 0",
        wordBreak: "break-all" as const,
        whiteSpace: "pre-wrap" as const,
        width: "100%",
      },
      onClick: (e: React.MouseEvent) => {
        if (isHighlighted && comment) {
          onLineClick(lineNumber, e);
        }
      },
    };
  };

  const handleReview = async () => {
    setIsReviewing(true);
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: selectedFile,
          code: fileContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to review code");
      }

      const data = await response.json();
      setReview(data.review);
    } catch (error) {
      console.error("Error reviewing code:", error);
      setReview("Error reviewing code. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <>
      <Card className='h-full rounded-none border-0 shadow-none bg-[#1e1e2e]'>
        <CardHeader className='border-b border-[#313244] bg-[#1e1e2e] py-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <span className="text-blue-400">📄</span> 
              <span>{selectedFile ? selectedFile.split('/').pop() : 'File Content'}</span>
              {selectedFile && (
                <span className="ml-2 text-xs text-gray-400 font-normal truncate max-w-[300px]">
                  {selectedFile}
                </span>
              )}
            </CardTitle>
            {selectedFile && (
              <Button 
                onClick={handleReview} 
                disabled={isReviewing} 
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Review File
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='flex-1 h-[calc(100%-3.5rem)] p-0 bg-[#1e1e2e] relative'>
          <ScrollArea className='h-full w-full pb-4' type="hover">
            {selectedFile ? (
              <div className='h-full'>
                <div className='px-4'>
                  <SyntaxHighlighter
                    language={getLanguageFromFileName(selectedFile)}
                    style={vscDarkPlus as any}
                    customStyle={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      height: "100%",
                      fontFamily: "'JetBrains Mono', monospace",
                      width: "100%",
                      maxWidth: "100%",
                      background: "#1e1e2e",
                      marginBottom: "1rem",
                    }}
                    showLineNumbers
                    wrapLines={true}
                    wrapLongLines={true}
                    lineProps={lineProps}
                    lineNumberStyle={{
                      minWidth: "2.5em", 
                      paddingRight: "1em",
                      color: "#6c7086",
                      textAlign: "right",
                      userSelect: "none",
                      position: "sticky",
                      left: 0,
                      background: "#1e1e2e",
                    }}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                </div>
                <ScrollBar orientation="horizontal" />
              </div>
            ) : (
              <div className='h-full flex items-center justify-center text-gray-400 p-4'>
                <p>Select a file from the list to view its content</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={onCloseDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-yellow-500">💡</span>
              <span>Comment on Line {selectedLine}</span>
            </DialogTitle>
          </DialogHeader>
          <div className='prose dark:prose-invert max-w-none text-sm bg-gray-50 p-4 rounded-md border border-gray-200'>
            <p className='whitespace-pre-wrap'>
              {selectedLine && lineComments[selectedLine] ? lineComments[selectedLine] : "No comment available for this line."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
