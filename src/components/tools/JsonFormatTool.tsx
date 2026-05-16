import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { jsonrepair } from "jsonrepair";

type Mode = "format" | "minify";

export function JsonFormatTool() {
  const [input, setInput] = useLocalStorage("tool:json-format", "");
  const [mode, setMode] = useState<Mode>("format");
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error, repaired } = useMemo(() => {
    if (!input) return { output: "", error: "", repaired: false };
    try {
      const parsed = JSON.parse(input);
      if (mode === "minify") return { output: JSON.stringify(parsed), error: "", repaired: false };
      return { output: JSON.stringify(parsed, null, 2), error: "", repaired: false };
    } catch (e) {
      try {
        const fixed = JSON.parse(jsonrepair(input));
        if (mode === "minify") return { output: JSON.stringify(fixed), error: "", repaired: true };
        return { output: JSON.stringify(fixed, null, 2), error: "", repaired: true };
      } catch {
        return { output: "", error: e instanceof Error ? e.message : "Invalid JSON", repaired: false };
      }
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-3">
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      {repaired && <Badge variant="outline" className="self-start text-xs text-yellow-600 border-yellow-400">Auto-repaired</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button size="sm" variant={mode === "format" ? "default" : "outline"} onClick={() => setMode("format")}>Format</Button>
              <Button size="sm" variant={mode === "minify" ? "default" : "outline"} onClick={() => setMode("minify")}>Minify</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
                onClick={() => setInput('{"name":"Alice","age":30,"active":true,"address":{"city":"Bangkok"}}')}>
                Example
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Paste JSON here… or drop a file"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <div className="hidden lg:block h-8 shrink-0" />
          <div className="flex-1 min-h-0">
            <CodeBlock code={output} language="json" placeholder="Output will appear here..." />
          </div>
        </div>
      </div>
    </div>
  );
}
