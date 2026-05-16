import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { cn } from "@/lib/utils";
import { yamlToJson } from "@/lib/tool-logic/data";

export function YamlToJsonTool() {
  const [input, setInput] = useLocalStorage("tool:yaml-to-json", "");
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error } = useMemo(() => {
    const result = yamlToJson(input);
    return result.ok ? { output: result.value, error: "" } : { output: "", error: result.error };
  }, [input]);

  return (
    <ToolLayout>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      <ToolPanels>
        <ToolPane gap={1}>
          <ToolToolbar
            onExample={() => setInput("name: Alice\nage: 30\nhobbies:\n  - reading\n  - coding")}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder="Paste YAML here… or drop a file"
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
