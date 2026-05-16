import { useState, useCallback } from "react";
import { copyToClipboard } from "@/lib/copy";

export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout]
  );

  return { copied, copy };
}
