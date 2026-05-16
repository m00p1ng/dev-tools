import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";
import { TOOLS } from "@/tools";

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);

  const tool = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTool={activeTool} onSelect={setActiveTool} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border px-4">
          <h1 className="text-sm font-medium text-foreground">{tool.label}</h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto p-4">
          <PlaceholderTool label={tool.label} />
        </main>
      </div>
    </div>
  );
}
