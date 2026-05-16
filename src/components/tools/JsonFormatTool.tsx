import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RotateCcw } from "lucide-react";

type Mode = "format" | "minify" | "validate";

export function JsonFormatTool() {
  const [input, setInput] = useLocalStorage("tool:json-format", "");
  const [mode, setMode] = useState<Mode>("format");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      if (mode === "format") return { output: JSON.stringify(parsed, null, 2), error: "" };
      if (mode === "minify") return { output: JSON.stringify(parsed), error: "" };
      return { output: "✓ Valid JSON", error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [input, mode]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "format" ? "default" : "outline"} onClick={() => setMode("format")}>Format</Button>
        <Button size="sm" variant={mode === "minify" ? "default" : "outline"} onClick={() => setMode("minify")}>Minify</Button>
        <Button size="sm" variant={mode === "validate" ? "default" : "outline"} onClick={() => setMode("validate")}>Validate</Button>
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Paste JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-full resize-none font-mono text-xs"
        />
        <CodeBlock code={output} language="json" placeholder="Output will appear here..." />
      </div>
    </div>
  );
}
