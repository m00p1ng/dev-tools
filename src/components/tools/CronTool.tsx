import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
  { label: "Every 1st of month", value: "0 0 1 * *" },
];

export function CronTool() {
  const [input, setInput] = useLocalStorage("tool:cron", "0 9 * * 1");
  const [error, setError] = useState("");

  let description = "";
  let nextRuns: Date[] = [];

  try {
    description = cronstrue.toString(input, { throwExceptionOnParseError: true });
    const interval = CronExpressionParser.parse(input);
    nextRuns = Array.from({ length: 5 }, () => interval.next().toDate());
    setError("");
  } catch {
    description = "";
    nextRuns = [];
    if (input) {
      // only set error if something was typed
    }
  }

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
        <p className="text-sm font-medium">Cron Expression</p>
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
          <button
            key={p.value}
            onClick={() => handleChange(p.value)}
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      {description && !error && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Human readable</p>
            <p className="text-sm font-medium">{description}</p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-2">Next 5 runs</p>
            <ol className="space-y-1">
              {nextRuns.map((d, i) => (
                <li key={i} className="font-mono text-xs">{d.toLocaleString()}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
