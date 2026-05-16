import { useEffect, useRef, useState } from "react";
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
import { Download, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import mermaid from "mermaid";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import { resolveSvgDimensions } from "@/lib/tool-logic/media";

Prism.languages.mermaid = {
  keyword: /\b(graph|flowchart|sequenceDiagram|participant|loop|alt|else|opt|par|rect|critical|gantt|classDiagram|stateDiagram-v2|pie|erDiagram|journey|mindmap)\b/,
  operator: /-->>|-->|--|->>|->|==>|==|->>|->|\b(and|or|not)\b/,
  string: { pattern: /"(?:\\.|[^\\"])*"/, greedy: true },
  comment: /%%.*$/,
  number: /\b\d+\b/,
};

type ImageFormat = "png" | "jpg" | "svg";

function downloadSvg(svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "diagram.svg";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadRaster(svg: string, format: "png" | "jpg") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const svgEl = doc.querySelector("svg")!;

  const { width: w, height: h } = resolveSvgDimensions(svgEl);
  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));

  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
    a.download = `diagram.${format}`;
    a.click();
  };
  img.src = dataUrl;
}

function download(svg: string, format: ImageFormat) {
  if (format === "svg") downloadSvg(svg);
  else downloadRaster(svg, format);
}

const EXAMPLE = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B`;

export function MermaidTool() {
  const [input, setInput] = useLocalStorage("tool:mermaid", EXAMPLE);
  const [svg, setSvg] = useState("");

  const [error, setError] = useState("");
  const idRef = useRef(0);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const [zoom, setZoom] = useState(1);
  const clampZoom = (z: number) => Math.min(4, Math.max(0.25, z));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default" });
    let active = true;

    if (!input.trim()) {
      Promise.resolve().then(() => {
        if (active) {
          setSvg("");
          setError("");
        }
      });
      return () => {
        active = false;
      };
    }

    const id = `mermaid-${++idRef.current}`;
    mermaid.render(id, input)
      .then(({ svg }) => {
        if (active) {
          setSvg(svg);
          setError("");
          setPan({ x: 0, y: 0 });
        }
      })
      .catch((e) => {
        document.querySelectorAll('[id^="dmermaid-"],[id^="mermaid-"]').forEach(el => el.remove());
        if (active) {
          setError(e?.message ?? "Invalid diagram");
        }
      });

    return () => {
      active = false;
    };
  }, [input, isDark]);

  return (
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
          <div
            className="relative flex-1 overflow-hidden rounded-md border border-border flex items-center justify-center"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onWheel={(e) => { e.preventDefault(); setZoom(z => clampZoom(z - e.deltaY * 0.001)); }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              setIsDragging(true);
              dragging.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
            }}
            onMouseMove={(e) => {
              if (!dragging.current) return;
              setPan({ x: dragging.current.panX + e.clientX - dragging.current.startX, y: dragging.current.panY + e.clientY - dragging.current.startY });
            }}
            onMouseUp={() => { setIsDragging(false); dragging.current = null; }}
            onMouseLeave={() => { setIsDragging(false); dragging.current = null; }}
          >
            {svg && (
              <div className="absolute right-2 top-2 z-10 flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setZoom(z => clampZoom(z + 0.1))}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setZoom(z => clampZoom(z - 0.1))}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <span className="text-[10px] font-mono">{Math.round(zoom * 100)}%</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {[50, 100, 125, 150, 200, 300, 400].map((p) => (
                      <DropdownMenuItem key={p} onClick={() => setZoom(p / 100)}>
                        {p}%
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Download className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => download(svg, "png")}>PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => download(svg, "jpg")}>JPG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => download(svg, "svg")}>SVG</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {svg
              ? <div
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: isDragging ? "none" : "transform 0.1s" }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              : !error && <p className="text-xs text-muted-foreground">Diagram will appear here...</p>
            }
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
