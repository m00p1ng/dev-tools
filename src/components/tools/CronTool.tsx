import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToolKeys } from "@/hooks/useToolKeys";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

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

  useToolKeys({ onClear: () => handleChange("") });

  const { description, nextRuns } = useMemo(() => {
    try {
      const d = cronstrue.toString(input, { throwExceptionOnParseError: true });
      const interval = CronExpressionParser.parse(input);
      const nr = Array.from({ length: 5 }, () => interval.next().toDate());
      return { description: d, nextRuns: nr };
    } catch {
      return { description: "", nextRuns: [] as Date[] };
    }
  }, [input]);

  function handleChange(val: string) {
    setInput(val);
    setError("");
    if (!val) return;
    try {
      cronstrue.toString(val, { throwExceptionOnParseError: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid cron expression");
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Cron Expression</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Kbd>⌘K</Kbd> clear
            </span>
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
        <p className="text-xs text-muted-foreground">Format: minute hour day-of-month month day-of-week</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            onClick={() => handleChange(p.value)}
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
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
                <p className="text-xs text-muted-foreground">Human readable</p>
                <CopyButton text={description} />
              </div>
              <p className="text-sm font-medium">{description}</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Next 5 runs</p>
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
                    <span className="font-mono text-xs">{d.toLocaleString()}</span>
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
