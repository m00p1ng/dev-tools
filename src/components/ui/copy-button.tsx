import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  withLabel?: boolean;
}

export function CopyButton({ text, className, withLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      size={withLabel ? "sm" : "icon-xs"}
      variant="ghost"
      className={cn(className)}
      onClick={handleCopy}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            className="flex items-center gap-1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className={cn("text-green-500", withLabel ? "h-3.5 w-3.5" : "h-3 w-3")} />
            {withLabel && <span className="text-green-500">Copied!</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="flex items-center gap-1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Copy className={cn(withLabel ? "h-3.5 w-3.5" : "h-3 w-3")} />
            {withLabel && <span>Copy</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
