import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    if (!("startViewTransition" in document)) {
      setThemeState(next);
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty("--vt-x", `${x}px`);
    document.documentElement.style.setProperty("--vt-y", `${y}px`);
    document.documentElement.style.setProperty("--vt-r", `${maxRadius}px`);

    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(() => {
        setThemeState(next);
        applyTheme(next);
      });
  }, []);

  return { theme, setTheme };
}
