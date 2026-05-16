import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language: string;
  placeholder?: string;
}

export function CodeBlock({ code, language, placeholder }: CodeBlockProps) {
  if (!code) {
    return (
      <div className="h-full rounded-md border border-input bg-background px-3 py-2 text-xs text-muted-foreground font-mono">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto rounded-md border border-input bg-background">
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 z-10 h-6 w-6"
        onClick={() => navigator.clipboard.writeText(code)}
      >
        <Copy className="h-3 w-3" />
      </Button>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: "0.5rem 0.75rem",
          background: "transparent",
          fontSize: "0.75rem",
          lineHeight: "1.5",
          minHeight: "100%",
        }}
        codeTagProps={{ style: { fontFamily: "inherit" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
