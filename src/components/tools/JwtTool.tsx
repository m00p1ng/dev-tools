import { useEffect, useRef, useState } from "react";
import { DecodedPanel } from "@/components/tools/jwt/DecodedJwtPanels";
import { JwtTokenInput } from "@/components/tools/jwt/JwtTokenInput";
import { SignatureVerification } from "@/components/tools/jwt/SignatureVerification";
import { useDropText } from "@/hooks/useDropText";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { base64urlEncode, decodeJwtToken, signHS256, verifyHS256, type JwtParts } from "@/lib/tool-logic/security";

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

  const { isDragging, dropProps } = useDropText((text) => decode(text.trim()));

  function decode(val: string) {
    setInput(val);
    setSigVerified(null);
    if (!val.trim()) {
      setParts(null);
      setError("");
      if (!skipPayloadSync.current) setPayloadEditStr("");
      return;
    }

    const result = decodeJwtToken(val);
    if (!result.ok) {
      setParts(null);
      setError(result.error);
      return;
    }

    const { payload } = result.value;
    setParts(result.value);
    setError("");
    if (!skipPayloadSync.current) {
      setPayloadEditStr(JSON.stringify(payload, null, 2));
      setPayloadEditError("");
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
    const shouldResign = parts.algorithm === "HS256" && secret;
    const newToken = shouldResign
      ? `${signingInput}.${await signEditedPayload(signingInput)}`
      : `${signingInput}.${parts.signature}`;

    const exp = typeof newPayload.exp === "number" ? newPayload.exp : null;
    const isExpired = exp !== null ? exp * 1000 < Date.now() : false;
    const expiresAt = exp ? new Date(exp * 1000).toLocaleString() : null;

    skipPayloadSync.current = true;
    setParts((prev) => (prev ? { ...prev, payload: newPayload, isExpired, expiresAt } : null));
    setInput(newToken);
    setSigVerified(null);
    skipPayloadSync.current = false;
  }

  async function signEditedPayload(signingInput: string) {
    try {
      return await signHS256(signingInput, secret, isBase64Secret);
    } catch {
      return parts?.signature ?? "";
    }
  }

  function clearToken() {
    decode("");
    setSecret("");
  }

  useEffect(() => {
    if (!input) return;

    const timer = setTimeout(() => decode(input), 0);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!parts || parts.algorithm !== "HS256" || !secret) {
        if (active) setSigVerified(null);
        return;
      }

      const result = await verifyHS256(input, secret, isBase64Secret);
      if (active) setSigVerified(result);
    }

    verify();
    return () => {
      active = false;
    };
  }, [secret, isBase64Secret, input, parts?.algorithm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <JwtTokenInput
        input={input}
        error={error}
        parts={parts}
        sigVerified={sigVerified}
        isDragging={isDragging}
        dropProps={dropProps}
        onChange={decode}
        onClear={clearToken}
      />

      <div className="flex flex-col flex-1 gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Decoded</span>

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
            <SignatureVerification
              parts={parts}
              secret={secret}
              isBase64Secret={isBase64Secret}
              onSecretChange={setSecret}
              onBase64SecretChange={setIsBase64Secret}
            />
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

