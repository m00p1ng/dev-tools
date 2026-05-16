import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { cn } from "@/lib/utils";
import yaml from "js-yaml";

export function JsonToYamlTool() {
  const [input, setInput] = useLocalStorage("tool:json-to-yaml", "");
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: yaml.dump(JSON.parse(input), { indent: 2 }), error: "" };
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
            onExample={() => setInput('{"name":"Alice","age":30,"hobbies":["reading","coding"]}')}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder="Paste JSON here… or drop a file"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane gap={1}>
          <div className="flex-1 min-h-0">
            <CodeBlock code={output} language="yaml" placeholder="YAML output..." />
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
