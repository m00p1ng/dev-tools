import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, X } from "lucide-react";
import { DiagramViewer } from "./DiagramViewer";
import type { ImageFormat } from "@/lib/tool-logic/diagram";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

interface FullscreenModalProps {
  open: boolean;
  svg: string;
  isDark: boolean;
  onDownload: (format: ImageFormat) => void;
  onClose: () => void;
}

export function FullscreenModal({ open, svg, isDark, onDownload, onClose }: FullscreenModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="backdrop-blur-md bg-black/40" />
        <AlertDialogPrimitive.Content
          onEscapeKeyDown={onClose}
          className="fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          style={{ width: "95vw", height: "95vh", background: isDark ? "#0a0a0a" : "#f8f8f8" }}
        >
          <div
            className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2"
            style={{ background: isDark ? "#111" : "#fff" }}
          >
            <span className="text-sm font-medium text-muted-foreground">Diagram Preview</span>
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Close fullscreen" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative min-h-0 flex-1">
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
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
