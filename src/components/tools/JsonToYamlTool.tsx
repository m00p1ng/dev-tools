import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
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
    <div className="flex h-full flex-col gap-3">
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        <div className="flex flex-col gap-1 min-h-0">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
              onClick={() => setInput('{"name":"Alice","age":30,"hobbies":["reading","coding"]}')}>
              Example
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setInput("")}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea
            placeholder="Paste JSON here… or drop a file"
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
            <CodeBlock code={output} language="yaml" placeholder="YAML output..." />
          </div>
        </div>
      </div>
    </div>
  );
}
