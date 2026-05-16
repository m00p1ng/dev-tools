import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { cn } from "@/lib/utils";

type Mode = "escape" | "unescape";

export function BackslashTool() {
  const [input, setInput] = useLocalStorage("tool:backslash", "");
  const [mode, setMode] = useState<Mode>("escape");
  const { isDragging, dropProps } = useDropText(setInput);

  const output = useMemo(() => {
    if (!input) return "";
    if (mode === "escape") {
      return input
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    } else {
      return input
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
  }, [input, mode]);

  return (
    <ToolLayout>
      <ToolPanels>
        <ToolPane>
          <ToolToolbar
            left={
              <>
                <Button size="sm" variant={mode === "escape" ? "default" : "outline"}
                  onClick={() => { setMode("escape"); if (output) setInput(output); }}>Escape</Button>
                <Button size="sm" variant={mode === "unescape" ? "default" : "outline"}
                  onClick={() => { setMode("unescape"); if (output) setInput(output); }}>Unescape</Button>
              </>
            }
            onExample={() => setInput('Hello "World"\nNew line\tTabbed')}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder="Input text… or drop a file"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane>
          <div className="relative flex-1 min-h-0">
            <Textarea
              readOnly
              value={output}
              placeholder="Output will appear here..."
              className="h-full resize-none font-mono text-xs"
            />
            {output && <CopyButton text={output} className="absolute right-2 top-2" />}
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
