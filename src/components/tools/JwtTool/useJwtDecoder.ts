import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { base64urlEncode, decodeJwtToken, signHS256, verifyHS256, type JwtParts } from "@/lib/tool-logic/security";

export function useJwtDecoder() {
  const [input, setInput] = useLocalStorage("tool:jwt", "");
  const [parts, setParts] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [isBase64Secret, setIsBase64Secret] = useState(false);
  const [sigVerified, setSigVerified] = useState<boolean | null>(null);
  const [payloadEditStr, setPayloadEditStr] = useState("");
  const [payloadEditError, setPayloadEditError] = useState("");
  const skipPayloadSync = useRef(false);

  const displayedSigVerified = parts?.algorithm === "HS256" && !secret ? false : sigVerified;

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

  async function signEditedPayload(signingInput: string) {
    try {
      return await signHS256(signingInput, secret, isBase64Secret);
    } catch {
      return parts?.signature ?? "";
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
    return () => { active = false; };
  }, [secret, isBase64Secret, input, parts?.algorithm]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    input,
    parts,
    error,
    secret,
    setSecret,
    isBase64Secret,
    setIsBase64Secret,
    sigVerified: displayedSigVerified,
    payloadEditStr,
    payloadEditError,
    decode,
    handlePayloadEdit,
    clearToken,
  };
}
