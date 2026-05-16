import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";

type Mode = "encode" | "decode";

export function UrlEncodeTool() {
  const [input, setInput] = useLocalStorage("tool:url-encode", "");
  const [mode, setMode] = useState<Mode>("encode");

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
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "encode" ? "default" : "outline"} onClick={() => setMode("encode")}>Encode</Button>
        <Button size="sm" variant={mode === "decode" ? "default" : "outline"} onClick={() => setMode("decode")}>Decode</Button>
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
          onClick={() => setInput("https://example.com/search?q=hello world&lang=en")}>
          Example
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Input text or encoded string..."
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
