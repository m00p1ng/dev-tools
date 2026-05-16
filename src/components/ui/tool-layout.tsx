import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col gap-3">{children}</div>;
}

export function ToolPanels({ children }: { children: React.ReactNode }) {
  return <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">{children}</div>;
}

interface PaneProps {
  children: React.ReactNode;
  gap?: 1 | 2;
  className?: string;
}

export function ToolPane({ children, gap = 2, className }: PaneProps) {
  return (
    <div className={cn("flex flex-col min-h-0", gap === 1 ? "gap-1" : "gap-2", className)}>
      {children}
    </div>
  );
}

export function ToolOutputPane({ children, gap = 2, className }: PaneProps) {
  return (
    <ToolPane gap={gap} className={className}>
      <div className="hidden lg:block h-8 shrink-0" />
      {children}
    </ToolPane>
  );
}

export function ToolSidebarLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full gap-4 min-h-0">{children}</div>;
}

export function ToolSidebar({ children }: { children: React.ReactNode }) {
  return <div className="w-64 shrink-0 flex flex-col gap-4">{children}</div>;
}

interface ToolToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  onExample?: () => void;
  onClear?: () => void;
}

export function ToolToolbar({ left, right, onExample, onClear }: ToolToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-1">{left}</div>
      <div className="flex items-center gap-1">
        {right}
        {onExample && (
          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={onExample}>
            Example
          </Button>
        )}
        {onClear && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
