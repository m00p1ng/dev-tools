import { useDropText } from "@/hooks/useDropText";
import { useJwtDecoder } from "./useJwtDecoder";
import { DecodedPanel } from "./DecodedJwtPanels";
import { JwtTokenInput } from "./JwtTokenInput";
import { SignatureVerification } from "./SignatureVerification";

export function JwtTool() {
  const {
    input,
    parts,
    error,
    secret,
    setSecret,
    isBase64Secret,
    setIsBase64Secret,
    sigVerified,
    payloadEditStr,
    payloadEditError,
    decode,
    handlePayloadEdit,
    clearToken,
  } = useJwtDecoder();

  const { isDragging, dropProps } = useDropText((text) => decode(text.trim()));

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

        <DecodedPanel
          title="Header"
          data={parts?.header ?? {}}
        />
        <DecodedPanel
          title="Payload"
          data={parts?.payload ?? {}}
          editable={!!parts}
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
      </div>
    </div>
  );
}
