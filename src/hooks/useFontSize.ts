import { useEffect, useState } from "react";
import { toast } from "sonner";

const MIN_SIZE = 50;
const MAX_SIZE = 200;
const STEP = 5;
const DEFAULT_SIZE = 100;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    const stored = localStorage.getItem("font-size");
    return stored ? parseInt(stored, 10) : DEFAULT_SIZE;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem("font-size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setFontSize((prev) => {
          const next = Math.min(prev + STEP, MAX_SIZE);
          toast.info(`Zoom: ${next}%`, { id: "zoom-toast", duration: 1000 });
          return next;
        });
      } else if (e.key === "-") {
        e.preventDefault();
        setFontSize((prev) => {
          const next = Math.max(prev - STEP, MIN_SIZE);
          toast.info(`Zoom: ${next}%`, { id: "zoom-toast", duration: 1000 });
          return next;
        });
      } else if (e.key === "0") {
        e.preventDefault();
        setFontSize(() => {
          toast.info("Zoom: 100%", { id: "zoom-toast", duration: 1000 });
          return DEFAULT_SIZE;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { fontSize, setFontSize };
}
