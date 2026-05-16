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
import { RotateCcw, Download, Info, Copy, ZoomIn, ZoomOut } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import { useTheme } from "@/hooks/useTheme";
import mermaid from "mermaid";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

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

  const vb = svgEl.getAttribute("viewBox");
  let w = parseFloat(svgEl.getAttribute("width") ?? "0");
  let h = parseFloat(svgEl.getAttribute("height") ?? "0");
  if ((!w || !h) && vb) {
    const parts = vb.split(/[\s,]+/);
    w = parseFloat(parts[2]) || 800;
    h = parseFloat(parts[3]) || 600;
  }
  w = w || 800;
  h = h || 600;
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [zoom, setZoom] = useState(1);
  const clampZoom = (z: number) => Math.min(4, Math.max(0.25, z));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default" });
    if (!input.trim()) {
      if (svg !== "" || error !== "") {
        setSvg("");
        setError("");
      }
      return;
    }
    const id = `mermaid-${++idRef.current}`;
    mermaid.render(id, input)
      .then(({ svg }) => { setSvg(svg); setError(""); setPan({ x: 0, y: 0 }); })
      .catch((e) => { setSvg(""); setError(e?.message ?? "Invalid diagram"); });
  }, [input, isDark]);

  return (
    <div className="flex h-full flex-col gap-2 min-h-0">
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setInput(EXAMPLE)}>
          Example
        </Button>
        <a
          href="https://mermaid.js.org/syntax/flowchart.html"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="h-3.5 w-3.5" />
          Syntax
        </a>
      </div>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="relative h-full overflow-auto rounded-md border border-input bg-background text-xs">
          {input && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 z-10 h-6 w-6"
              onClick={() => copyToClipboard(input)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
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
        <div
          className="relative overflow-hidden rounded-md border border-border flex items-center justify-center"
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
      </div>
    </div>
  );
}
