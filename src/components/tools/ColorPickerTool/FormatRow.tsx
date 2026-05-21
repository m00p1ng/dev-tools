import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
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
  const focusedRef = useRef(false);

  if (!focusedRef.current && value !== prev) { setPrev(value); setRaw(value); setIsError(false); }

  const commit = () => setIsError(!onCommit(raw));

  return (
    <div className={cn("rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors", isError && "border-destructive")}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <CopyButton text={value} />
      </div>
      <Input
        className="w-full font-mono text-sm text-foreground"
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setIsError(false); onCommit(e.target.value); }}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; commit(); }}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        spellCheck={false}
      />
    </div>
  );
}
