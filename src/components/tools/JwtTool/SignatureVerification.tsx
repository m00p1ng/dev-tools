import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { JwtParts } from "@/lib/tool-logic/security";

interface SignatureVerificationProps {
  parts: JwtParts | null;
  secret: string;
  isBase64Secret: boolean;
  onSecretChange: (value: string) => void;
  onBase64SecretChange: (checked: boolean) => void;
}

export function SignatureVerification({
  parts,
  secret,
  isBase64Secret,
  onSecretChange,
  onBase64SecretChange,
}: SignatureVerificationProps) {
  const supportsVerification = parts?.algorithm === "HS256";

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">Signature Verification</span>
        {!supportsVerification && (
          <Badge variant="outline" className="text-orange-400 border-orange-400 text-xs py-0 h-4">
            HS256 only
          </Badge>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Secret</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-sm text-muted-foreground">BASE64URL ENCODED</span>
            <Switch size="sm" checked={isBase64Secret} onCheckedChange={onBase64SecretChange} />
          </label>
        </div>
        <input
          aria-label="JWT verification secret"
          type="text"
          value={secret}
          onChange={(e) => onSecretChange(e.target.value)}
          placeholder="your-256-bit-secret"
          disabled={!supportsVerification}
          className="w-full font-mono text-sm bg-muted/30 border border-border rounded px-2 py-1.5 outline-none focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {parts && supportsVerification && secret && (
          <p className="text-xs text-muted-foreground">Payload edits will be re-signed with this secret.</p>
        )}
        {parts && supportsVerification && !secret && (
          <p className="text-xs text-muted-foreground">
            Without a secret, edited payload keeps the original signature (invalid).
          </p>
        )}
      </div>
    </div>
  );
}
