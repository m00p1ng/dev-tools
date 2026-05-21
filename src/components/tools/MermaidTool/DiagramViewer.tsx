import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from "lucide-react";

interface DiagramViewerProps {
  svg: string;
  onFullscreen?: () => void;
}

const clampZoom = (z: number) => Math.min(4, Math.max(0.25, z));

export function DiagramViewer({ svg, onFullscreen }: DiagramViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Select zoom">
                <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
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
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom in" onClick={() => setZoom(z => clampZoom(z + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom out" onClick={() => setZoom(z => clampZoom(z - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Reset view" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          {onFullscreen && (
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Fullscreen preview" onClick={onFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {svg
        ? <div
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: isDragging ? "none" : "transform 0.1s" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        : <p className="text-xs text-muted-foreground">Diagram will appear here...</p>
      }
    </div>
  );
}
