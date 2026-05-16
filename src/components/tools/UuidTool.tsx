import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { Copy, Plus, Trash2 } from "lucide-react";

type UuidVersion = "v1" | "v4" | "v7";

export function UuidTool() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  function generate() {
    setUuids(
      Array.from({ length: count }, () => {
        if (version === "v1") return uuidv1();
        if (version === "v7") return uuidv7();
        return uuidv4();
      })
    );
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {(["v1", "v4", "v7"] as UuidVersion[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={version === v ? "default" : "outline"}
              onClick={() => setVersion(v)}
            >
              {v.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="h-8 w-8"
            onClick={() => setCount(Math.max(1, count - 1))}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="w-16 text-center h-8 text-sm"
          />
          <Button size="icon" variant="outline" className="h-8 w-8"
            onClick={() => setCount(Math.min(100, count + 1))}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button size="sm" onClick={generate}>Generate</Button>
        {uuids.length > 0 && (
          <Button size="sm" variant="outline" onClick={copyAll}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {uuids.map((id) => (
          <div key={id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <Badge variant="outline" className="font-mono text-xs shrink-0">{version}</Badge>
            <span className="font-mono text-sm flex-1 select-all">{id}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => navigator.clipboard.writeText(id)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
