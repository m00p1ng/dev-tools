import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [input, setInput] = useLocalStorage("tool:base64", "");
  const [mode, setMode] = useState<Mode>("encode");
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        const bytes = new TextEncoder().encode(input);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
        return { output: btoa(binary), error: "" };
      } else {
        const binary = atob(input.trim());
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return { output: new TextDecoder().decode(bytes), error: "" };
      }
    } catch {
      return { output: "", error: mode === "encode" ? "Encoding failed" : "Invalid Base64 string" };
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-3">
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button size="sm" variant={mode === "encode" ? "default" : "outline"}
                onClick={() => { setMode("encode"); if (output) setInput(output); }}>Encode</Button>
              <Button size="sm" variant={mode === "decode" ? "default" : "outline"}
                onClick={() => { setMode("decode"); if (output) setInput(output); }}>Decode</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
                onClick={() => setInput("Hello, World!")}>
                Example
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Input text or Base64… or drop a file"
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
