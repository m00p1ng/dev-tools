import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCronExpression } from "@/lib/tool-logic/web-time";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
  { label: "Every 1st of month", value: "0 0 1 * *" },
];

const listVariants = { visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export function CronTool() {
  const [input, setInput] = useLocalStorage("tool:cron", "0 9 * * 1");
  const [error, setError] = useState("");

  const { description, nextRuns } = useMemo(() => {
    const result = parseCronExpression(input);
    return result.ok ? result.value : { description: "", nextRuns: [] as Date[] };
  }, [input]);

  function handleChange(val: string) {
    setInput(val);
    setError("");
    if (!val) return;
    const result = parseCronExpression(val);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium">Cron Expression</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleChange("")}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="* * * * *"
          className="font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">Format: minute hour day-of-month month day-of-week</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            onClick={() => handleChange(p.value)}
            className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <AnimatePresence>
        {description && !error && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Human readable</p>
                <CopyButton text={description} />
              </div>
              <p className="text-base font-medium">{description}</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground mb-2">Next 5 runs</p>
              <motion.ol
                className="space-y-1"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {nextRuns.map((d, i) => (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    className="group flex items-center justify-between"
                  >
                    <span className="font-mono text-sm">{d.toLocaleString()}</span>
                    <CopyButton text={d.toLocaleString()} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
