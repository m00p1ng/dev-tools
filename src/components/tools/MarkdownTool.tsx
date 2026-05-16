import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export function MarkdownTool() {
  const [input, setInput] = useLocalStorage("tool:markdown", "# Hello\n\nType **markdown** here.");

  return (
    <div className="flex h-full flex-col gap-2 min-h-0">
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write markdown here..."
        className="h-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
        spellCheck={false}
      />
      <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-md border border-border p-4 text-sm">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {input}
        </ReactMarkdown>
      </div>
    </div>
    </div>
  );
}
