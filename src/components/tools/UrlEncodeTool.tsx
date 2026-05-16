import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { transformUrlComponent } from "@/lib/tool-logic/encoding";

type Mode = "encode" | "decode";

export function UrlEncodeTool() {
  return (
    <TextTransformTool<Mode>
      storageKey="tool:url-encode"
      initialMode="encode"
      modes={[
        { value: "encode", label: "Encode" },
        { value: "decode", label: "Decode" },
      ]}
      inputPlaceholder="Input text or encoded string... or drop a file"
      outputPlaceholder="Output will appear here..."
      example="https://example.com/search?q=hello world&lang=en"
      transform={transformUrlComponent}
      adoptOutputOnModeChange
    />
  );
}
