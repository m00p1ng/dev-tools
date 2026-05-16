import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";

const CHARSET = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function randomChar(charset: string, rand: number): string {
  return charset[rand % charset.length];
}

function generateString(length: number, charset: string, symbolCharset: string | null): string {
  if (!charset) return "";
  const rands = new Uint8Array(length + 4);
  crypto.getRandomValues(rands);

  if (!symbolCharset || length < 2) {
    return Array.from(rands.slice(0, length), (b) => randomChar(charset, b)).join("");
  }

  const nonSymbol = charset.replace(new RegExp(`[${symbolCharset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`, "g"), "");
  const minSymbols = Math.max(1, Math.floor(length * 0.1));
  const maxSymbols = Math.max(minSymbols, Math.floor(length * 0.2));
  const symbolCount = minSymbols + (rands[length] % (maxSymbols - minSymbols + 1));

  const chars: string[] = [
    ...Array.from({ length: symbolCount }, (_, i) => randomChar(symbolCharset, rands[i])),
    ...Array.from({ length: length - symbolCount }, (_, i) => randomChar(nonSymbol || charset, rands[symbolCount + i])),
  ];

  // Fisher-Yates shuffle using last 2 random bytes as seed index
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rands[i % rands.length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function SliderWithInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [raw, setRaw] = useState(String(value));

  if (value !== prevValue) {
    setPrevValue(value);
    setRaw(String(value));
  }

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const commit = () => {
    const n = Number(raw);
    const clamped = clamp(isNaN(n) ? min : n);
    setRaw(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <Input
          type="number"
          min={min}
          max={max}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="h-7 w-20 text-center font-mono text-sm"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

export function RandomStringTool() {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [options, setOptions] = useState({
    letters: true,
    digits: true,
    symbols: false,
  });
  const [version, setVersion] = useState(0);

  const charset = Object.entries(options)
    .filter(([, v]) => v)
    .map(([k]) => CHARSET[k as keyof typeof CHARSET])
    .join("");

  const symbolCharset = options.symbols ? CHARSET.symbols : null;

  const results = useMemo(() => {
    // version is used to trigger regeneration
    void version;
    return charset ? Array.from({ length: count }, () => generateString(length, charset, symbolCharset)) : [];
  }, [length, count, charset, symbolCharset, version]);

  const generate = () => {
    setVersion((v) => v + 1);
  };

  const toggle = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SliderWithInput label="Length" value={length} min={1} max={256} onChange={setLength} />
        <SliderWithInput label="Count" value={count} min={1} max={50} onChange={setCount} />
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
          <Button size="sm" variant="outline" onClick={() => copyToClipboard(results.join("\n"))}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {results.map((s, i) => (
          <div key={i} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <span className="font-mono text-sm flex-1 break-all select-all">{s}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => copyToClipboard(s)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
