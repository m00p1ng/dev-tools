import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";

export function BackslashTool() {
  const [input, setInput] = useLocalStorage("tool:backslash", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function escapeStr() {
    setOutput(
      input
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
    );
    setError("");
  }

  function unescapeStr() {
    try {
      setOutput(
        input
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\")
      );
      setError("");
    } catch {
      setError("Unescape failed");
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={escapeStr}>Escape</Button>
        <Button size="sm" variant="outline" onClick={unescapeStr}>Unescape</Button>
        <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(""); }}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Input text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-full resize-none font-mono text-xs"
        />
        <div className="relative">
          <Textarea
            readOnly
            value={output}
            placeholder="Output will appear here..."
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
