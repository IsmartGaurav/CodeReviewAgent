import { MarkdownRenderer } from "./markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export function CodeReview({ review }: { review: string }) {
  return (
    <Card className="h-full rounded-none border-0 shadow-none bg-[#1e1e2e]">
      <CardHeader className="border-b border-[#313244] bg-[#1e1e2e] py-3">
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <span className="text-green-400">💖</span>
          <span>Code Review</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 h-[calc(100%-3.5rem)] p-0 bg-[#1e1e2e]">
        <ScrollArea className="h-full pb-4">
          <div className="p-5">
            {review ? (
              <div className="prose prose-invert max-w-none mb-4">
                <MarkdownRenderer content={review} />
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
                <div className="rounded-full bg-[#2a2a3a] p-4 mb-2">
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
                    className="text-gray-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <p className="font-medium text-gray-300">Click &quot;Review File&quot; to analyze this file</p>
                <p className="text-sm text-gray-500 max-w-sm text-center">AI will scan the code and provide insights on code quality, patterns, potential bugs, and suggested improvements.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
