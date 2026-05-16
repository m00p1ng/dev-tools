import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { useToolKeys } from "@/hooks/useToolKeys";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

export function UrlEncodeTool() {
  const [input, setInput] = useLocalStorage("tool:url-encode", "");
  const [mode, setMode] = useState<Mode>("encode");
  const { isDragging, dropProps } = useDropText(setInput);

  useToolKeys({ onClear: () => setInput("") });

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input), error: "" };
    } catch {
      return { output: "", error: mode === "encode" ? "Encoding failed" : "Invalid encoded string" };
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          <Button size="sm" variant={mode === "encode" ? "default" : "outline"}
            onClick={() => { setMode("encode"); if (output) setInput(output); }}>Encode</Button>
          <Button size="sm" variant={mode === "decode" ? "default" : "outline"}
            onClick={() => { setMode("decode"); if (output) setInput(output); }}>Decode</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
          onClick={() => setInput("https://example.com/search?q=hello world&lang=en")}>
          Example
        </Button>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <Kbd>⌘K</Kbd> clear
        </span>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Input text or encoded string… or drop a file"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn("h-full resize-none font-mono text-xs transition-all duration-150",
            isDragging && "ring-2 ring-primary/50 bg-primary/5")}
          {...dropProps}
        />
        <div className="relative">
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
  );
}
