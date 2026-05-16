import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TextTransformTool } from "@/components/tools/shared/TextTransformTool";
import { csvToJson } from "@/lib/tool-logic/data";

export function CsvToJsonTool() {
  const [header, setHeader] = useState(true);

  return (
    <TextTransformTool
      storageKey="tool:csv-to-json"
      initialMode="default"
      inputPlaceholder={"name,age\nAlice,30\nBob,25"}
      outputPlaceholder="JSON output..."
      example={"name,age,city\nAlice,30,Bangkok\nBob,25,London"}
      transform={(input) => csvToJson(input, header)}
      outputLanguage="json"
      gap={1}
      toolbarLeft={
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={header} onCheckedChange={setHeader} />
          First row as header
        </label>
      }
    />
  );
}
