import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "escape" | "unescape";

export function BackslashTool() {
  const [input, setInput] = useLocalStorage("tool:backslash", "");
  const [mode, setMode] = useState<Mode>("escape");
  const { isDragging, dropProps } = useDropText(setInput);

  const output = useMemo(() => {
    if (!input) return "";
    if (mode === "escape") {
      return input
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    } else {
      return input
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button size="sm" variant={mode === "escape" ? "default" : "outline"}
                onClick={() => { setMode("escape"); if (output) setInput(output); }}>Escape</Button>
              <Button size="sm" variant={mode === "unescape" ? "default" : "outline"}
                onClick={() => { setMode("unescape"); if (output) setInput(output); }}>Unescape</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
                onClick={() => setInput('Hello "World"\nNew line\tTabbed')}>
                Example
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Input text… or drop a file"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <div className="hidden lg:block h-8 shrink-0" />
          <div className="relative flex-1 min-h-0">
            <Textarea
              readOnly
              value={output}
              placeholder="Output will appear here..."
              className="h-full resize-none font-mono text-xs"
            />
            {output && <CopyButton text={output} className="absolute right-2 top-2" />}
          </div>
        </div>
      </div>
    </div>
  );
}
