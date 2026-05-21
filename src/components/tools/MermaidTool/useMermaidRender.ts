import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export function useMermaidRender(input: string) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const idRef = useRef(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default" });
    let active = true;

    if (!input.trim()) {
      Promise.resolve().then(() => {
        if (active) {
          setSvg("");
          setError("");
        }
      });
      return () => { active = false; };
    }

    const id = `mermaid-${++idRef.current}`;
    mermaid.render(id, input)
      .then(({ svg }) => {
        if (active) {
          setSvg(svg);
          setError("");
        }
      })
      .catch((e) => {
        document.querySelectorAll('[id^="dmermaid-"],[id^="mermaid-"]').forEach(el => el.remove());
        if (active) {
          setError(e?.message ?? "Invalid diagram");
        }
      });

    return () => { active = false; };
  }, [input, isDark]);

  return { svg, error, isDark };
}
