import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";

type Mode = "escape" | "unescape";

export function BackslashTool() {
  const [input, setInput] = useLocalStorage("tool:backslash", "");
  const [mode, setMode] = useState<Mode>("escape");

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
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "escape" ? "default" : "outline"} onClick={() => setMode("escape")}>Escape</Button>
        <Button size="sm" variant={mode === "unescape" ? "default" : "outline"} onClick={() => setMode("unescape")}>Unescape</Button>
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Input text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-full resize-none font-mono text-xs"
        />
        <div className="relative">
          <Textarea
            readOnly
            value={output}
            placeholder="Output will appear here..."
            className="h-full resize-none font-mono text-xs"
          />
          {output && (
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 h-6 w-6"
              onClick={() => navigator.clipboard.writeText(output)}>
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
