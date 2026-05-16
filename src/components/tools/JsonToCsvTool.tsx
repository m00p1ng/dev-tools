import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

export function JsonToCsvTool() {
  const [input, setInput] = useLocalStorage("tool:json-to-csv", "");
  const { isDragging, dropProps } = useDropText(setInput);

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
      <div className="flex items-center gap-2 flex-wrap">
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
          className={cn("h-full resize-none font-mono text-xs transition-all duration-150",
            isDragging && "ring-2 ring-primary/50 bg-primary/5")}
          {...dropProps}
        />
        <div className="relative">
          <Textarea
            readOnly
            value={output}
            placeholder="CSV output..."
            className="h-full resize-none font-mono text-xs"
          />
          {output && <CopyButton text={output} className="absolute right-2 top-2" />}
        </div>
      </div>
    </div>
  );
}
