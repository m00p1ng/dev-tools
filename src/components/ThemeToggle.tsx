import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 overflow-hidden"
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTheme(theme === "light" ? "dark" : "light", {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      title={`Theme: ${theme}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
