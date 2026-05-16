import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { yamlToJson } from "@/lib/tool-logic/data";

export function YamlToJsonTool() {
  return (
    <TextTransformTool
      storageKey="tool:yaml-to-json"
      initialMode="default"
      inputPlaceholder="Paste YAML here... or drop a file"
      outputPlaceholder="JSON output..."
      example={"name: Alice\nage: 30\nhobbies:\n  - reading\n  - coding"}
      transform={(input) => yamlToJson(input)}
      outputLanguage="json"
      gap={1}
    />
  );
}
