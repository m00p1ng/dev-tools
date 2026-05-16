import { useEffect, useLayoutEffect, useRef } from "react";

interface ToolKeysOptions {
  onSubmit?: () => void;
  onClear?: () => void;
}

export function useToolKeys({ onSubmit, onClear }: ToolKeysOptions) {
  const submitRef = useRef(onSubmit);
  const clearRef = useRef(onClear);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    clearRef.current = onClear;
  });

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter" && submitRef.current) {
        e.preventDefault();
        submitRef.current();
      }
      if (mod && e.key === "k" && clearRef.current) {
        e.preventDefault();
        clearRef.current();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
