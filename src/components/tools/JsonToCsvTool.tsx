import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { jsonToCsv } from "@/lib/tool-logic/data";

export function JsonToCsvTool() {
  return (
    <TextTransformTool
      storageKey="tool:json-to-csv"
      initialMode="default"
      inputPlaceholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
      outputPlaceholder="CSV output..."
      example={'[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
      transform={(input) => jsonToCsv(input)}
      gap={1}
    />
  );
}
