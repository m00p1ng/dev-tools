import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CodeBlock } from "@/components/ui/code-block";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

export function CsvToJsonTool() {
  const [input, setInput] = useLocalStorage("tool:csv-to-json", "");
  const [header, setHeader] = useState(true);
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    const result = Papa.parse(input.trim(), { header, skipEmptyLines: true, dynamicTyping: true });
    if (result.errors.length) return { output: "", error: result.errors[0].message };
    return { output: JSON.stringify(result.data, null, 2), error: "" };
  }, [input, header]);

  return (
    <div className="flex h-full flex-col gap-3">
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={header} onCheckedChange={setHeader} />
              First row as header
            </label>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
                onClick={() => setInput("name,age,city\nAlice,30,Bangkok\nBob,25,London")}>
                Example
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            placeholder={"name,age\nAlice,30\nBob,25"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </div>
        <div className="flex flex-col gap-1 min-h-0">
          <div className="hidden lg:block h-8 shrink-0" />
          <div className="flex-1 min-h-0">
            <CodeBlock code={output} language="json" placeholder="JSON output..." />
          </div>
        </div>
      </div>
    </div>
  );
}
