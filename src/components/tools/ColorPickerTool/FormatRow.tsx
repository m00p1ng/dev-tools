import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface FormatRowProps {
  label: string;
  value: string;
  onCommit: (raw: string) => boolean;
}

export function FormatRow({ label, value, onCommit }: FormatRowProps) {
  const [raw, setRaw] = useState(value);
  const [prev, setPrev] = useState(value);
  const [isError, setIsError] = useState(false);

  if (value !== prev) { setPrev(value); setRaw(value); setIsError(false); }

  const commit = () => setIsError(!onCommit(raw));

  return (
    <div className={cn("rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors", isError && "border-destructive")}>
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="outline" className="text-xs font-mono">{label}</Badge>
        <CopyButton text={value} />
      </div>
      <input
        className="w-full bg-transparent font-mono text-sm outline-none text-foreground"
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setIsError(false); }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        spellCheck={false}
      />
    </div>
  );
}
