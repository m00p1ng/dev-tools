import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { transformBackslash } from "@/lib/tool-logic/encoding";

type Mode = "escape" | "unescape";

export function BackslashTool() {
  return (
    <TextTransformTool<Mode>
      storageKey="tool:backslash"
      initialMode="escape"
      modes={[
        { value: "escape", label: "Escape" },
        { value: "unescape", label: "Unescape" },
      ]}
      inputPlaceholder="Input text... or drop a file"
      outputPlaceholder="Output will appear here..."
      example={'Hello "World"\nNew line\tTabbed'}
      transform={transformBackslash}
      adoptOutputOnModeChange
    />
  );
}
