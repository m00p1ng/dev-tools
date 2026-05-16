import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools";
import { Search } from "lucide-react";

interface SidebarProps {
  activeTool: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeTool, onSelect }: SidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = TOOLS.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <span className="text-sm font-semibold text-sidebar-foreground">Dev Utils</span>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 pb-4">
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">No tools found</p>
          ) : (
            filtered.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeTool === tool.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {tool.label}
              </button>
            ))
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
