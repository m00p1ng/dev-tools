import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Copy, Plus, Trash2 } from "lucide-react";

const CHARSET = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function generateString(length: number, charset: string): string {
  if (!charset) return "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => charset[b % charset.length]).join("");
}

export function RandomStringTool() {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: false,
  });
  const [results, setResults] = useState<string[]>([]);

  const charset = Object.entries(options)
    .filter(([, v]) => v)
    .map(([k]) => CHARSET[k as keyof typeof CHARSET])
    .join("");

  function generate() {
    setResults(Array.from({ length: count }, () => generateString(length, charset)));
  }

  const toggle = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Length</p>
          <Input
            type="number"
            min={1}
            max={1024}
            value={length}
            onChange={(e) => setLength(Math.max(1, Math.min(1024, Number(e.target.value))))}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Count</p>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => setCount(Math.max(1, count - 1))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="text-center h-8 text-sm"
            />
            <Button size="icon" variant="outline" className="h-8 w-8"
              onClick={() => setCount(Math.min(50, count + 1))}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
            <Switch checked={options[key]} onCheckedChange={() => toggle(key)} />
            {key}
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={generate} disabled={!charset}>Generate</Button>
        {results.length > 1 && (
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(results.join("\n"))}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {results.map((s, i) => (
          <div key={i} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <span className="font-mono text-sm flex-1 break-all select-all">{s}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => navigator.clipboard.writeText(s)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
