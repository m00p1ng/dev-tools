import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ToolContent } from "@/components/ToolContent";
import { TOOLS } from "@/tools";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tool = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && <Sidebar activeTool={activeTool} onSelect={setActiveTool} />}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-xs" onClick={() => setSidebarOpen((v) => !v)}>
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </Button>
            <h1 className="text-sm font-medium text-foreground">{tool.label}</h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto p-4">
          <ToolContent toolId={activeTool} />
        </main>
      </div>
    </div>
  );
}
