import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { jsonToYaml } from "@/lib/tool-logic/data";

export function JsonToYamlTool() {
  return (
    <TextTransformTool
      storageKey="tool:json-to-yaml"
      initialMode="default"
      inputPlaceholder="Paste JSON here... or drop a file"
      outputPlaceholder="YAML output..."
      example={'{"name":"Alice","age":30,"hobbies":["reading","coding"]}'}
      transform={(input) => jsonToYaml(input)}
      outputLanguage="yaml"
      gap={1}
    />
  );
}
