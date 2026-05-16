import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { jwtDecode } from "jwt-decode";

interface JwtParts {
  header: object;
  payload: object;
  signature: string;
  expired: boolean;
  expiresAt: string | null;
}

export function JwtTool() {
  const [input, setInput] = useLocalStorage("tool:jwt", "");
  const [parts, setParts] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  function decode(val: string) {
    setInput(val);
    if (!val.trim()) {
      setParts(null);
      setError("");
      return;
    }
    try {
      const header = jwtDecode(val, { header: true });
      const payload = jwtDecode<Record<string, unknown>>(val);
      const signature = val.split(".")[2] ?? "";
      const exp = typeof payload["exp"] === "number" ? payload["exp"] : null;
      const expired = exp !== null ? exp * 1000 < Date.now() : false;
      const expiresAt = exp ? new Date(exp * 1000).toLocaleString() : null;
      setParts({ header, payload, signature, expired, expiresAt });
      setError("");
    } catch {
      setParts(null);
      setError("Invalid JWT");
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Textarea
        placeholder="Paste JWT token here..."
        value={input}
        onChange={(e) => decode(e.target.value)}
        className="resize-none font-mono text-xs h-24"
      />

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      {parts && (
        <div className="flex-1 overflow-auto space-y-4">
          <div className="flex items-center gap-2">
            {parts.expired ? (
              <Badge variant="destructive">Expired</Badge>
            ) : (
              <Badge variant="outline" className="border-green-500 text-green-600">Valid</Badge>
            )}
            {parts.expiresAt && (
              <span className="text-xs text-muted-foreground">Expires: {parts.expiresAt}</span>
            )}
          </div>

          <Section title="Header" data={parts.header} />
          <Section title="Payload" data={parts.payload} />

          <div>
            <p className="text-sm font-medium mb-1">Signature</p>
            <p className="font-mono text-xs break-all text-muted-foreground bg-muted p-2 rounded">{parts.signature}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, data }: { title: string; data: object }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <pre className="font-mono text-xs bg-muted rounded p-3 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
