import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { cn } from "@/lib/utils";
import { jsonrepair } from "jsonrepair";

type Mode = "format" | "minify";

export function JsonFormatTool() {
  const [input, setInput] = useLocalStorage("tool:json-format", "");
  const [mode, setMode] = useState<Mode>("format");
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error, repaired } = useMemo(() => {
    if (!input) return { output: "", error: "", repaired: false };
    try {
      const parsed = JSON.parse(input);
      if (mode === "minify") return { output: JSON.stringify(parsed), error: "", repaired: false };
      return { output: JSON.stringify(parsed, null, 2), error: "", repaired: false };
    } catch (e) {
      try {
        const fixed = JSON.parse(jsonrepair(input));
        if (mode === "minify") return { output: JSON.stringify(fixed), error: "", repaired: true };
        return { output: JSON.stringify(fixed, null, 2), error: "", repaired: true };
      } catch {
        return { output: "", error: e instanceof Error ? e.message : "Invalid JSON", repaired: false };
      }
    }
  }, [input, mode]);

  return (
    <ToolLayout>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      {repaired && <Badge variant="outline" className="self-start text-xs text-yellow-600 border-yellow-400">Auto-repaired</Badge>}
      <ToolPanels>
        <ToolPane>
          <ToolToolbar
            left={
              <>
                <Button size="sm" variant={mode === "format" ? "default" : "outline"} onClick={() => setMode("format")}>Format</Button>
                <Button size="sm" variant={mode === "minify" ? "default" : "outline"} onClick={() => setMode("minify")}>Minify</Button>
              </>
            }
            onExample={() => setInput('{"name":"Alice","age":30,"active":true,"address":{"city":"Bangkok"}}')}
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
        <ToolOutputPane>
          <div className="flex-1 min-h-0">
            <CodeBlock code={output} language="json" placeholder="Output will appear here..." />
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
