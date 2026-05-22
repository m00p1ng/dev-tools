import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { yamlToJson, jsonToYaml } from "@/lib/tool-logic/data";

type Mode = "yaml-to-json" | "json-to-yaml";

export function YamlJsonTool() {
  return (
    <TextTransformTool<Mode>
      storageKey="tool:yaml-json"
      initialMode="yaml-to-json"
      modes={[
        { value: "yaml-to-json", label: "YAML" },
        { value: "json-to-yaml", label: "JSON" },
      ]}
      inputPlaceholder={(mode) =>
        mode === "yaml-to-json"
          ? "Paste YAML here... or drop a file"
          : "Paste JSON here... or drop a file"
      }
      outputPlaceholder="Output will appear here..."
      example={(mode) =>
        mode === "yaml-to-json"
          ? "name: Alice\nage: 30\nhobbies:\n  - reading\n  - coding"
          : '{"name":"Alice","age":30,"hobbies":["reading","coding"]}'
      }
      transform={(input, mode) => mode === "yaml-to-json" ? yamlToJson(input) : jsonToYaml(input)}
      outputLanguage={(mode) => (mode === "yaml-to-json" ? "json" : "yaml")}
      adoptOutputOnModeChange
      gap={1}
    />
  );
}
