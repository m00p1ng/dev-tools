import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Copy, RotateCcw } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import CryptoJS from "crypto-js";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
type Algo = typeof ALGOS[number];

export function HashTool() {
  const [input, setInput] = useLocalStorage("tool:hash", "");
  const [encoding, setEncoding] = useState<"hex" | "base64">("hex");

  const results: Record<Algo, string> = {} as Record<Algo, string>;
  if (input) {
    for (const algo of ALGOS) {
      const wordArray = (() => {
        switch (algo) {
          case "MD5": return CryptoJS.MD5(input);
          case "SHA-1": return CryptoJS.SHA1(input);
          case "SHA-256": return CryptoJS.SHA256(input);
          case "SHA-512": return CryptoJS.SHA512(input);
        }
      })();
      results[algo] = encoding === "base64"
        ? wordArray.toString(CryptoJS.enc.Base64)
        : wordArray.toString(CryptoJS.enc.Hex);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(["hex", "base64"] as const).map((enc) => (
            <Button key={enc} size="sm" variant={encoding === enc ? "default" : "outline"}
              onClick={() => setEncoding(enc)}>
              {enc}
            </Button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setInput("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground"
          onClick={() => setInput("Hello, World!")}>
          Example
        </Button>
      </div>

      <Textarea
        placeholder="Enter text to hash..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="resize-none font-mono text-xs h-24"
      />

      <div className="flex-1 overflow-auto space-y-2">
        {ALGOS.map((algo) => (
          <div key={algo} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">{algo}</Badge>
              {input && (
                <Button size="icon" variant="ghost" className="h-6 w-6"
                  onClick={() => copyToClipboard(results[algo])}>
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="font-mono text-xs break-all text-muted-foreground">
              {input ? results[algo] : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
