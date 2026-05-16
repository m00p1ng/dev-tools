import { CopyButton } from "@/components/ui/copy-button";
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
      <div className="h-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground font-mono">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto rounded-md border border-input bg-background">
      <CopyButton text={code} className="absolute right-2 top-2 z-10" />
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: "0.5rem 0.75rem",
          background: "transparent",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          minHeight: "100%",
        }}
        wrapLongLines
        codeTagProps={{ style: { fontFamily: "inherit" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
