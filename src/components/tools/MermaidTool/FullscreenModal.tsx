import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, X } from "lucide-react";
import { DiagramViewer } from "./DiagramViewer";
import type { ImageFormat } from "@/lib/tool-logic/diagram";

interface FullscreenModalProps {
  svg: string;
  isDark: boolean;
  onDownload: (format: ImageFormat) => void;
  onClose: () => void;
}

export function FullscreenModal({ svg, isDark, onDownload, onClose }: FullscreenModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: isDark ? "#0a0a0a" : "#f8f8f8" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0"
        style={{ background: isDark ? "#111" : "#fff" }}
      >
        <span className="text-sm font-medium text-muted-foreground">Diagram Preview</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Close fullscreen" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative flex-1 min-h-0">
        <DiagramViewer svg={svg} />
        <div className="absolute bottom-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-7 w-7 shadow-md" aria-label="Download diagram">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              <DropdownMenuItem onClick={() => onDownload("png")}>PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("jpg")}>JPG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("svg")}>SVG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>,
    document.body,
  );
}
