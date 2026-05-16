import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { transformBase64 } from "@/lib/tool-logic/encoding";

type Mode = "encode" | "decode";

export function Base64Tool() {
  return (
    <TextTransformTool<Mode>
      storageKey="tool:base64"
      initialMode="encode"
      modes={[
        { value: "encode", label: "Encode" },
        { value: "decode", label: "Decode" },
      ]}
      inputPlaceholder="Input text or Base64... or drop a file"
      outputPlaceholder="Output will appear here..."
      example="Hello, World!"
      transform={transformBase64}
      adoptOutputOnModeChange
    />
  );
}
