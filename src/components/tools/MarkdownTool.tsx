import { useLocalStorage } from "@/hooks/useLocalStorage";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export function MarkdownTool() {
  const [input, setInput] = useLocalStorage("tool:markdown", "# Hello\n\nType **markdown** here.");

  return (
    <div className="grid h-full grid-cols-2 gap-3 min-h-0">
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
  );
}
