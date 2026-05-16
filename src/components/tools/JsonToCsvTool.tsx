import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
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
    <ToolLayout>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      <ToolPanels>
        <ToolPane gap={1}>
          <ToolToolbar
            onExample={() => setInput('[{"name":"Alice","age":30},{"name":"Bob","age":25}]')}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane gap={1}>
          <div className="relative flex-1 min-h-0">
            <Textarea
              readOnly
              value={output}
              placeholder="CSV output..."
              className="h-full resize-none font-mono text-xs"
            />
            {output && <CopyButton text={output} className="absolute right-2 top-2" />}
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
