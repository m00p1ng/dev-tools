import { Badge } from "@/components/ui/badge";
import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { formatJson, type JsonFormatMeta } from "@/lib/tool-logic/data";

type Mode = "format" | "minify";

export function JsonFormatTool() {
  return (
    <TextTransformTool<Mode, JsonFormatMeta>
      storageKey="tool:json-format"
      initialMode="format"
      modes={[
        { value: "format", label: "Format" },
        { value: "minify", label: "Minify" },
      ]}
      inputPlaceholder="Paste JSON here... or drop a file"
      outputPlaceholder="Output will appear here..."
      example={'{"name":"Alice","age":30,"active":true,"address":{"city":"Bangkok"}}'}
      transform={formatJson}
      outputLanguage="json"
      renderMeta={(meta) =>
        meta.repaired ? (
          <Badge variant="outline" className="border-yellow-400 text-xs text-yellow-600">
            Auto-repaired
          </Badge>
        ) : null
      }
    />
  );
}
