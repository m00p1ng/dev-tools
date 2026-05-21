import { useCallback, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { Download, Info } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import { downloadDiagram } from "@/lib/tool-logic/diagram";
import { useMermaidRender } from "./useMermaidRender";
import { DiagramViewer } from "./DiagramViewer";
import { FullscreenModal } from "./FullscreenModal";

Prism.languages.mermaid = {
  keyword: /\b(graph|flowchart|sequenceDiagram|participant|loop|alt|else|opt|par|rect|critical|gantt|classDiagram|stateDiagram-v2|pie|erDiagram|journey|mindmap)\b/,
  operator: /-->>|-->|--|->>|->|==>|==|->>|->|\b(and|or|not)\b/,
  string: { pattern: /"(?:\\.|[^\\"])*"/, greedy: true },
  comment: /%%.*$/,
  number: /\b\d+\b/,
};

const EXAMPLE = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B`;

export function MermaidTool() {
  const [input, setInput] = useLocalStorage("tool:mermaid", EXAMPLE);
  const [fullscreen, setFullscreen] = useState(false);
  const { svg, error, isDark } = useMermaidRender(input);

  const handleDownload = useCallback((format: Parameters<typeof downloadDiagram>[1]) => downloadDiagram(svg, format), [svg]);

  return (
    <>
      <ToolLayout>
        {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
        <ToolPanels>
          <ToolPane gap={1}>
            <ToolToolbar
              left={
                <a
                  href="https://mermaid.js.org/syntax/flowchart.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  Syntax
                </a>
              }
              onExample={() => setInput(EXAMPLE)}
              onClear={() => setInput("")}
            />
            <div className="relative flex-1 overflow-auto rounded-md border border-input bg-background text-xs">
              {input && <CopyButton text={input} className="absolute right-2 top-2 z-10" />}
              <Editor
                value={input}
                onValueChange={setInput}
                highlight={(code) => Prism.highlight(code, Prism.languages.mermaid, "mermaid")}
                padding={10}
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.875rem",
                  minHeight: "100%",
                  background: "transparent",
                  color: isDark ? "#e2e8f0" : "#1e293b",
                }}
                textareaClassName="outline-none"
                spellCheck={false}
              />
            </div>
          </ToolPane>
          <ToolOutputPane gap={1}>
            <div className="relative flex-1 overflow-hidden rounded-md border border-border">
              {!error && <DiagramViewer svg={svg} onFullscreen={svg ? () => setFullscreen(true) : undefined} />}
              {error && <div className="flex h-full items-center justify-center"><p className="text-xs text-muted-foreground">Fix errors to see diagram</p></div>}
              {svg && !error && (
                <div className="absolute bottom-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-9 w-9 shadow-sm" aria-label="Download diagram">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top">
                      <DropdownMenuItem onClick={() => downloadDiagram(svg, "png")}>PNG</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadDiagram(svg, "jpg")}>JPG</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadDiagram(svg, "svg")}>SVG</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </ToolOutputPane>
        </ToolPanels>
      </ToolLayout>
      <FullscreenModal open={fullscreen && !!svg} svg={svg ?? ""} isDark={isDark} onDownload={handleDownload} onClose={() => setFullscreen(false)} />
    </>
  );
}
