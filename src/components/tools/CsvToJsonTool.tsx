import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";
import Papa from "papaparse";

export function CsvToJsonTool() {
  const [input, setInput] = useLocalStorage("tool:csv-to-json", "");
  const [header, setHeader] = useState(true);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    const result = Papa.parse(input.trim(), { header, skipEmptyLines: true, dynamicTyping: true });
    if (result.errors.length) return { output: "", error: result.errors[0].message };
    return { output: JSON.stringify(result.data, null, 2), error: "" };
  }, [input, header]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-4">
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={header} onCheckedChange={setHeader} />
          First row as header
        </label>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder={"name,age\nAlice,30\nBob,25"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-full resize-none font-mono text-xs"
        />
        <div className="relative">
          <Textarea
            readOnly
            value={output}
            placeholder="JSON output..."
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
