import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { jwtDecode } from "jwt-decode";
import { Copy, Check, RotateCcw } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";

// ---- helpers ----

function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function base64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function verifyHS256(token: string, secret: string, isBase64url: boolean): Promise<boolean> {
  try {
    const [h, p, sig] = token.split(".");
    if (!h || !p || !sig) return false;
    const keyBytes = isBase64url ? base64urlToBytes(secret) : new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, base64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
  } catch {
    return false;
  }
}

async function signHS256(signingInput: string, secret: string, isBase64url: boolean): Promise<string> {
  const keyBytes = isBase64url ? base64urlToBytes(secret) : new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function syntaxHighlight(json: string): string {
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-orange-400";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-blue-300" : "text-green-400";
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400";
      } else if (match === "null") {
        cls = "text-gray-400";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const CLAIM_LABELS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires At",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
};

const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);

// ---- interfaces ----

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: string | null;
  algorithm: string;
}

// ---- sub-components ----

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);
  return { copied, copy };
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <Button variant="ghost" size="icon-xs" onClick={() => copy(text)} className="text-muted-foreground">
      {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
    </Button>
  );
}

function JsonPanel({ data }: { data: object }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre
      className="font-mono text-sm p-3 overflow-auto leading-relaxed"
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
    />
  );
}

function ClaimsPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="p-3 space-y-2 font-mono text-sm overflow-auto">
      {Object.entries(data).map(([key, val]) => {
        const label = CLAIM_LABELS[key] ?? key;
        const display =
          TIME_CLAIMS.has(key) && typeof val === "number"
            ? new Date(val * 1000).toLocaleString()
            : JSON.stringify(val);
        return (
          <div key={key} className="flex gap-2">
            <span className="text-blue-300 min-w-[100px] shrink-0">{label}</span>
            <span className="text-green-400 break-all">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

type TabType = "json" | "claims";

interface DecodedPanelProps {
  title: string;
  data: Record<string, unknown>;
  editable?: boolean;
  editValue?: string;
  onEditChange?: (val: string) => void;
  editError?: string;
}

const OVERLAY_SHARED = "font-mono text-sm p-3 whitespace-pre-wrap break-words leading-[1.5] tracking-normal";

function EditableJsonOverlay({ value, onChange, error }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid min-h-[80px]">
        <pre
          aria-hidden
          className={`[grid-area:1/1] ${OVERLAY_SHARED} pointer-events-none select-none`}
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(value) + "\n" }}
        />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`[grid-area:1/1] ${OVERLAY_SHARED} bg-transparent text-transparent caret-foreground resize-none outline-none`}
          spellCheck={false}
        />
      </div>
      {error && <p className="text-xs text-destructive px-3 pb-2">{error}</p>}
    </div>
  );
}

function DecodedPanel({ title, data, editable, editValue, onEditChange, editError }: DecodedPanelProps) {
  const [tab, setTab] = useState<TabType>("json");
  const json = JSON.stringify(data, null, 2);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/40">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <div className="flex items-center gap-1">
          <div className="flex text-xs rounded overflow-hidden border border-border">
            {(["json", "claims"] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2 py-0.5 transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "json" ? "JSON" : "Claims"}
              </button>
            ))}
          </div>
          <CopyButton text={json} />
        </div>
      </div>
      <div className="bg-background overflow-auto">
        {tab === "json" && editable ? (
          <EditableJsonOverlay
            value={editValue ?? json}
            onChange={onEditChange ?? (() => {})}
            error={editError}
          />
        ) : tab === "json" ? (
          <JsonPanel data={data} />
        ) : (
          <ClaimsPanel data={data} />
        )}
      </div>
    </div>
  );
}

function ColoredToken({ token }: { token: string }) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return <span className="text-foreground">{token}</span>;
  }
  const [h, p, s] = parts;
  return (
    <span>
      <span className="text-red-400">{h}</span>
      <span className="text-foreground">.</span>
      <span className="text-purple-400">{p}</span>
      <span className="text-foreground">.</span>
      <span className="text-cyan-400">{s}</span>
    </span>
  );
}

// ---- main ----

export function JwtTool() {
  const [input, setInput] = useLocalStorage("tool:jwt", "");
  const [parts, setParts] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [isBase64Secret, setIsBase64Secret] = useState(false);
  const [sigVerified, setSigVerified] = useState<boolean | null>(null);
  const [payloadEditStr, setPayloadEditStr] = useState("");
  const [payloadEditError, setPayloadEditError] = useState("");
  const skipPayloadSync = useRef(false);

  function decode(val: string) {
    setInput(val);
    setSigVerified(null);
    if (!val.trim()) {
      setParts(null);
      setError("");
      if (!skipPayloadSync.current) setPayloadEditStr("");
      return;
    }
    try {
      const header = jwtDecode<Record<string, unknown>>(val, { header: true });
      const payload = jwtDecode<Record<string, unknown>>(val);
      const signature = val.split(".")[2] ?? "";
      const exp = typeof payload["exp"] === "number" ? payload["exp"] : null;
      const isExpired = exp !== null ? exp * 1000 < Date.now() : false;
      const expiresAt = exp ? new Date(exp * 1000).toLocaleString() : null;
      const algorithm = typeof header["alg"] === "string" ? header["alg"] : "unknown";
      setParts({ header, payload, signature, isExpired, expiresAt, algorithm });
      setError("");
      if (!skipPayloadSync.current) {
        setPayloadEditStr(JSON.stringify(payload, null, 2));
        setPayloadEditError("");
      }
    } catch {
      setParts(null);
      setError("Invalid JWT");
    }
  }

  async function handlePayloadEdit(val: string) {
    setPayloadEditStr(val);
    setPayloadEditError("");

    if (!parts) return;

    let newPayload: Record<string, unknown>;
    try {
      newPayload = JSON.parse(val);
    } catch {
      setPayloadEditError("Invalid JSON");
      return;
    }

    const headerB64url = base64urlEncode(JSON.stringify(parts.header));
    const payloadB64url = base64urlEncode(JSON.stringify(newPayload));
    const signingInput = `${headerB64url}.${payloadB64url}`;

    let newToken: string;
    if (parts.algorithm === "HS256" && secret) {
      try {
        const sig = await signHS256(signingInput, secret, isBase64Secret);
        newToken = `${signingInput}.${sig}`;
      } catch {
        newToken = `${signingInput}.${parts.signature}`;
      }
    } else {
      newToken = `${signingInput}.${parts.signature}`;
    }

    const exp = typeof newPayload["exp"] === "number" ? newPayload["exp"] : null;
    const isExpired = exp !== null ? exp * 1000 < Date.now() : false;
    const expiresAt = exp ? new Date(exp * 1000).toLocaleString() : null;

    skipPayloadSync.current = true;
    setParts((prev) => (prev ? { ...prev, payload: newPayload, isExpired, expiresAt } : null));
    setInput(newToken);
    setSigVerified(null);
    skipPayloadSync.current = false;
  }

  useEffect(() => {
    if (input) {
      const timer = setTimeout(() => decode(input), 0);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!parts || parts.algorithm !== "HS256" || !secret) {
        if (active) setSigVerified(null);
        return;
      }
      const result = await verifyHS256(input, secret, isBase64Secret);
      if (active) setSigVerified(result);
    };
    verify();
    return () => {
      active = false;
    };
  }, [secret, isBase64Secret, input, parts?.algorithm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT: encoded token */}
      <div className="flex flex-col lg:w-2/5 gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Encoded Token
          </span>
          <div className="flex items-center gap-1">
            {input && <CopyButton text={input} />}
            <Button size="sm" variant="ghost" className="h-auto py-0 px-1.5"
              onClick={() => { decode(""); setSecret(""); }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground h-auto py-0"
              onClick={() => decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")}>
              Example
            </Button>
          </div>
        </div>

        {/* color overlay textarea */}
        <div className="relative min-h-48 h-48 lg:h-64 rounded-md border border-border bg-muted/20 overflow-hidden">
          <div className="absolute inset-0 p-3 font-mono text-sm leading-[1.5] tracking-normal whitespace-pre-wrap break-all pointer-events-none overflow-hidden">
            {input ? (
              <ColoredToken token={input} />
            ) : (
              <span className="text-muted-foreground">Paste JWT token here...</span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => decode(e.target.value)}
            className="absolute inset-0 w-full h-full p-3 font-mono text-sm leading-[1.5] tracking-normal whitespace-pre-wrap break-all bg-transparent text-transparent caret-foreground resize-none outline-none"
            spellCheck={false}
          />
        </div>

        {/* status indicators */}
        <div className="flex flex-col gap-1 pb-1">
          {error ? (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <span>✗</span><span>{error}</span>
            </div>
          ) : parts ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-green-500">
                <span>✓</span><span>Valid JWT</span>
              </div>
              {sigVerified === true && (
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <span>✓</span><span>Signature Verified</span>
                </div>
              )}
              {sigVerified === false && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <span>✗</span><span>Invalid Signature</span>
                </div>
              )}
              {parts.isExpired && (
                <div className="flex items-center gap-1.5 text-xs text-orange-500">
                  <span>⚠</span>
                  <span>Expired{parts.expiresAt ? `: ${parts.expiresAt}` : ""}</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* RIGHT: decoded */}
      <div className="flex flex-col flex-1 gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Decoded
        </span>

        {parts ? (
          <>
            <DecodedPanel title="Header" data={parts.header} />
            <DecodedPanel
              title="Payload"
              data={parts.payload}
              editable
              editValue={payloadEditStr}
              onEditChange={handlePayloadEdit}
              editError={payloadEditError}
            />

            {/* signature verification */}
            <div className="border border-border rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Signature Verification
                </span>
                {parts.algorithm !== "HS256" && (
                  <Badge variant="outline" className="text-orange-400 border-orange-400 text-[10px] py-0 h-4">
                    HS256 only
                  </Badge>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Secret</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-xs text-muted-foreground">BASE64URL ENCODED</span>
                    <Switch size="sm" checked={isBase64Secret} onCheckedChange={setIsBase64Secret} />
                  </label>
                </div>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="your-256-bit-secret"
                  disabled={parts.algorithm !== "HS256"}
                  className="w-full font-mono text-xs bg-muted/30 border border-border rounded px-2 py-1.5 outline-none focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {parts.algorithm === "HS256" && secret && (
                  <p className="text-[10px] text-muted-foreground">
                    Payload edits will be re-signed with this secret.
                  </p>
                )}
                {parts.algorithm === "HS256" && !secret && (
                  <p className="text-[10px] text-muted-foreground">
                    Without a secret, edited payload keeps the original signature (invalid).
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            Paste a JWT token to decode
          </div>
        )}
      </div>
    </div>
  );
}
