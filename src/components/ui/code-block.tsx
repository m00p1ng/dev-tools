import { useSyncExternalStore } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

interface CodeBlockProps {
  code: string;
  language: string;
  placeholder?: string;
}

export function CodeBlock({ code, language, placeholder }: CodeBlockProps) {
  const dark = useSyncExternalStore(subscribe, isDarkMode, () => false);
  if (!code) {
    return (
      <div className="h-full rounded-md border border-input bg-background px-3 py-2 text-base text-muted-foreground font-mono">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto rounded-md border border-input bg-background">
      <SyntaxHighlighter
        language={language}
        style={dark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "0.5rem 0.75rem",
          background: "transparent",
          fontSize: "1rem",
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
