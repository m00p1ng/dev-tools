import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ flexShrink: 0 }}
          >
            <Sidebar activeTool={activeTool} onSelect={setActiveTool} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-xs" onClick={() => setSidebarOpen((v) => !v)}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={sidebarOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={activeTool}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium text-foreground"
              >
                {tool.label}
              </motion.h1>
            </AnimatePresence>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <ToolContent toolId={activeTool} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
