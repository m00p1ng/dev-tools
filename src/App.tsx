import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ToolContent } from "@/components/ToolContent";
import { Onboarding } from "@/components/Onboarding";
import { TOOLS } from "@/tools";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useFontSize } from "@/hooks/useFontSize";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function App() {
  const isMobile = useIsMobile();
  const [activeTool, setActiveTool] = useState(() => {
    const param = new URLSearchParams(window.location.search).get("tool");
    return TOOLS.find((t) => t.id === param)?.id ?? TOOLS[0].id;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage<boolean>("onboarding-v1", false);
  const { theme } = useTheme();
  useFontSize();

  const handleOnboardingComplete = (toolId?: string) => {
    setHasSeenOnboarding(true);
    if (toolId) setActiveTool(toolId);
  };

  const handleToolSelect = (id: string) => {
    setActiveTool(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", id);
    history.replaceState(null, "", url);
    if (isMobile) setSidebarOpen(false);
  };

  const tool = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0];

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {!hasSeenOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Toaster position="bottom-right" theme={theme} />

      <AnimatePresence initial={false}>
        {sidebarOpen && isMobile && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ flexShrink: 0 }}
            className={isMobile ? "fixed inset-y-0 left-0 z-50" : undefined}
          >
            <Sidebar activeTool={activeTool} onSelect={handleToolSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
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
