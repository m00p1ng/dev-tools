import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";

export function JsonFormatTool() {
  const [input, setInput] = useLocalStorage("tool:json-format", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function format() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function validate() {
    try {
      JSON.parse(input);
      setError("");
      setOutput("✓ Valid JSON");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={format}>Format</Button>
        <Button size="sm" variant="outline" onClick={minify}>Minify</Button>
        <Button size="sm" variant="outline" onClick={validate}>Validate</Button>
        <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(""); }}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Paste JSON here..."
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
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 h-6 w-6" onClick={copyOutput}>
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
