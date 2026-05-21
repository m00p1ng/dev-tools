import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolSidebarLayout, ToolSidebar } from "@/components/ui/tool-layout";
import { motion, AnimatePresence } from "framer-motion";
import { buildRandomCharset, clampNumber, generateRandomString, RANDOM_CHARSET } from "@/lib/tool-logic/generators";
import { listVariants, itemVariants } from "@/lib/animation-presets";
import { CopyableMonoItem } from "@/components/ui/copyable-mono-item";

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

  const commit = () => {
    const n = Number(raw);
    const clamped = clampNumber(isNaN(n) ? min : n, min, max);
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
      <Slider min={min} max={max} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

export function RandomStringTool() {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [options, setOptions] = useState({ letters: true, digits: true, symbols: false });
  const [version, setVersion] = useState(0);

  const charset = buildRandomCharset(options);

  const symbolCharset = options.symbols ? RANDOM_CHARSET.symbols : null;

  const results = useMemo(() => {
    void version;
    return charset ? Array.from({ length: count }, () => generateRandomString(length, charset, symbolCharset)) : [];
  }, [length, count, charset, symbolCharset, version]);

  const generate = () => setVersion((v) => v + 1);

  const toggle = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolSidebarLayout>
      <ToolSidebar>
        <SliderWithInput label="Length" value={length} min={1} max={256} onChange={setLength} />
        <SliderWithInput label="Count" value={count} min={1} max={50} onChange={setCount} />

        <div className="flex flex-col gap-2">
          {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <Switch checked={options[key]} onCheckedChange={() => toggle(key)} />
              {key}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={generate} disabled={!charset}>Generate</Button>
          {results.length > 1 && (
            <CopyButton text={results.join("\n")} withLabel />
          )}
        </div>
      </ToolSidebar>

      <AnimatePresence mode="wait">
        <motion.div
          key={version}
          className="flex-1 overflow-auto rounded-lg border border-border p-2 space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {results.map((s, i) => (
            <motion.div key={i} variants={itemVariants}>
              <CopyableMonoItem text={s} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </ToolSidebarLayout>
  );
}
