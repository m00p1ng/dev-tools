import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RotateCcw } from "lucide-react";
import Papa from "papaparse";

export function JsonToCsvTool() {
  const [input, setInput] = useLocalStorage("tool:json-to-csv", "");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) return { output: "", error: "Input must be a JSON array" };
      return { output: Papa.unparse(parsed), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [input]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
          onClick={() => setInput('[{"name":"Alice","age":30},{"name":"Bob","age":25}]')}>
          Example
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-full resize-none font-mono text-xs"
        />
        <CodeBlock code={output} language="csv" placeholder="CSV output..." />
      </div>
    </div>
  );
}
