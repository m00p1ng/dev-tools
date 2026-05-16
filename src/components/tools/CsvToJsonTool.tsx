import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CodeBlock } from "@/components/ui/code-block";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { cn } from "@/lib/utils";
import { csvToJson } from "@/lib/tool-logic/data";

export function CsvToJsonTool() {
  const [input, setInput] = useLocalStorage("tool:csv-to-json", "");
  const [header, setHeader] = useState(true);
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error } = useMemo(() => {
    const result = csvToJson(input, header);
    return result.ok ? { output: result.value, error: "" } : { output: "", error: result.error };
  }, [input, header]);

  return (
    <ToolLayout>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      <ToolPanels>
        <ToolPane gap={1}>
          <ToolToolbar
            left={
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={header} onCheckedChange={setHeader} />
                First row as header
              </label>
            }
            onExample={() => setInput("name,age,city\nAlice,30,Bangkok\nBob,25,London")}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder={"name,age\nAlice,30\nBob,25"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane gap={1}>
          <div className="flex-1 min-h-0">
            <CodeBlock code={output} language="json" placeholder="JSON output..." />
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
