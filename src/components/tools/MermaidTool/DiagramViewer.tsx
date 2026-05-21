import { useDiagramViewport } from "./useDiagramViewport";
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

const ZOOM_PRESETS = [50, 100, 125, 150, 200, 300, 400];

export function DiagramViewer({ svg, onFullscreen }: DiagramViewerProps) {
  const {
    containerRef,
    zoom,
    pan,
    fitToScreen,
    zoomIn,
    zoomOut,
    setZoomPreset,
    handlers,
  } = useDiagramViewport();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ cursor: "grab", touchAction: "none" }}
      {...handlers}
    >
      {svg && (
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Select zoom"
              >
                <span className="text-xs font-mono">
                  {Math.round(zoom * 100)}%
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ZOOM_PRESETS.map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => setZoomPreset(p / 100)}
                >
                  {p}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Zoom in"
            onClick={zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Zoom out"
            onClick={zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Fit to screen"
            onClick={fitToScreen}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {onFullscreen && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Fullscreen preview"
              onClick={onFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {svg
        ? <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            pointerEvents: "none",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        : <p className="text-xs text-muted-foreground">
          Diagram will appear here...
        </p>
      }
    </div>
  );
}
