import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import type { JwtParts } from "@/lib/tool-logic/security";
import { RotateCcw } from "lucide-react";

const EXAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

interface JwtTokenInputProps {
  input: string;
  error: string;
  parts: JwtParts | null;
  sigVerified: boolean | null;
  isDragging: boolean;
  dropProps: Record<string, unknown>;
  onChange: (value: string) => void;
  onClear: () => void;
}

function ColoredToken({ token }: { token: string }) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return <span className="text-foreground">{token}</span>;
  }

  const [header, payload, signature] = parts;
  return (
    <span>
      <span className="text-red-400">{header}</span>
      <span className="text-foreground">.</span>
      <span className="text-purple-400">{payload}</span>
      <span className="text-foreground">.</span>
      <span className="text-cyan-400">{signature}</span>
    </span>
  );
}

function JwtStatus({
  error,
  parts,
  sigVerified,
}: Pick<JwtTokenInputProps, "error" | "parts" | "sigVerified">) {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive">
        <span>x</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!parts) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 text-xs text-green-500">
        <span>✓</span>
        <span>Valid JWT</span>
      </div>
      {sigVerified === true && (
        <div className="flex items-center gap-1.5 text-xs text-green-500">
          <span>✓</span>
          <span>Signature Verified</span>
        </div>
      )}
      {sigVerified === false && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <span>x</span>
          <span>Invalid Signature</span>
        </div>
      )}
      {parts.isExpired && (
        <div className="flex items-center gap-1.5 text-xs text-orange-500">
          <span>!</span>
          <span>Expired{parts.expiresAt ? `: ${parts.expiresAt}` : ""}</span>
        </div>
      )}
    </>
  );
}

export function JwtTokenInput({
  input,
  error,
  parts,
  sigVerified,
  isDragging,
  dropProps,
  onChange,
  onClear,
}: JwtTokenInputProps) {
  return (
    <div className="flex flex-col flex-1 gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Encoded Token</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground h-auto py-0"
            onClick={() => onChange(EXAMPLE_TOKEN)}
          >
            Example
          </Button>
          <Button size="sm" variant="ghost" className="h-auto py-0 px-1.5" onClick={onClear} aria-label="Clear JWT">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 border border-border rounded-md overflow-hidden">
        <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground py-0.5">JSON Web Token (JWT)</span>
          {input && <CopyButton text={input} />}
        </div>

        <div className="p-3 flex flex-col flex-1 gap-2">
          <div
            className={cn(
              "relative flex-1 min-h-48 rounded-md border border-border bg-muted/20 overflow-hidden transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5",
            )}
          >
            <div className="absolute inset-0 p-3 font-mono text-sm leading-[1.5] tracking-normal whitespace-pre-wrap break-all pointer-events-none overflow-hidden">
              {input ? <ColoredToken token={input} /> : <span className="text-muted-foreground">Paste JWT token here... or drop a file</span>}
            </div>
            <textarea
              aria-label="Encoded JWT token"
              value={input}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full p-3 font-mono text-sm leading-[1.5] tracking-normal whitespace-pre-wrap break-all bg-transparent text-transparent caret-foreground resize-none outline-none"
              spellCheck={false}
              {...dropProps}
            />
          </div>

          <div className="flex flex-col gap-1">
            <JwtStatus
              error={error}
              parts={parts}
              sigVerified={sigVerified}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
