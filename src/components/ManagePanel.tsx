import { RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Tool } from "@/tools";

interface ManagePanelProps {
  allGroups: [string, Tool[]][];
  hiddenTools: string[];
  onToggleHidden: (id: string) => void;
  onReset: () => void;
}

export function ManagePanel({ allGroups, hiddenTools, onToggleHidden, onReset }: ManagePanelProps) {
  const hiddenSet = new Set(hiddenTools);

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Visible Tools
        </span>
        {hiddenTools.length > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-2.5" />
            Reset
          </button>
        )}
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 pb-4 space-y-4">
          {allGroups.map(([group, tools]) => (
            <div key={group}>
              <p className="px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <div className="space-y-1">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-sidebar-accent/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <tool.icon className={cn("size-3.5 shrink-0", tool.color)} />
                      <span className="text-xs text-sidebar-foreground truncate">{tool.label}</span>
                    </div>
                    <Switch
                      checked={!hiddenSet.has(tool.id)}
                      onCheckedChange={() => onToggleHidden(tool.id)}
                      className="shrink-0 ml-2 scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
