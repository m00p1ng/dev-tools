import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";

export function UrlEncodeTool() {
  const [input, setInput] = useLocalStorage("tool:url-encode", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function encode() {
    try {
      setOutput(encodeURIComponent(input));
      setError("");
    } catch {
      setError("Encoding failed");
    }
  }

  function decode() {
    try {
      setOutput(decodeURIComponent(input));
      setError("");
    } catch {
      setError("Invalid encoded string");
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={encode}>Encode</Button>
        <Button size="sm" variant="outline" onClick={decode}>Decode</Button>
        <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(""); }}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      <div className="grid flex-1 grid-cols-2 gap-3 min-h-0">
        <Textarea
          placeholder="Input text or encoded string..."
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
