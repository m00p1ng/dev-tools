import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { csvToJson, jsonToCsv } from "@/lib/tool-logic/data";

type Mode = "csv-to-json" | "json-to-csv";

export function CsvJsonTool() {
  const [header, setHeader] = useState(true);

  return (
    <TextTransformTool<Mode>
      storageKey="tool:csv-json"
      initialMode="csv-to-json"
      modes={[
        { value: "csv-to-json", label: "CSV" },
        { value: "json-to-csv", label: "JSON" },
      ]}
      inputPlaceholder={(mode) =>
        mode === "csv-to-json"
          ? "name,age\nAlice,30\nBob,25"
          : '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'
      }
      outputPlaceholder="Output will appear here..."
      example={(mode) =>
        mode === "csv-to-json"
          ? "name,age,city\nAlice,30,Bangkok\nBob,25,London"
          : '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
      }
      transform={(input, mode) =>
        mode === "csv-to-json" ? csvToJson(input, header) : jsonToCsv(input)
      }
      outputLanguage={(mode) => (mode === "csv-to-json" ? "json" : "plaintext")}
      adoptOutputOnModeChange
      gap={1}
      toolbarLeft={(mode) =>
        mode === "csv-to-json" ? (
          <label className="ml-1 flex items-center gap-2 text-sm">
            <Switch checked={header} onCheckedChange={setHeader} />
            Header
          </label>
        ) : null
      }
    />
  );
}
