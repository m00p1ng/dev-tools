import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/ui/copy-button";
import { LoremIpsum } from "lorem-ipsum";
import { motion, AnimatePresence } from "framer-motion";

const lorem = new LoremIpsum();

type Unit = "words" | "sentences" | "paragraphs";

export function LoremIpsumTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [countRaw, setCountRaw] = useState("3");
  const [version, setVersion] = useState(0);

  const output = useMemo(() => {
    void version;
    if (unit === "words") return lorem.generateWords(count);
    if (unit === "sentences") return lorem.generateSentences(count);
    return lorem.generateParagraphs(count);
  }, [unit, count, version]);

  return (
    <div className="flex h-full gap-4 min-h-0">
      <div className="w-64 shrink-0 flex flex-col gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Unit</p>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Count</p>
            <Input
              type="number"
              min={1}
              max={100}
              value={countRaw}
              onChange={(e) => setCountRaw(e.target.value)}
              onBlur={() => {
                const n = Math.max(1, Math.min(100, Number(countRaw) || 1));
                setCount(n);
                setCountRaw(String(n));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-7 w-20 text-center font-mono text-sm"
            />
          </div>
          <Slider min={1} max={100} step={1} value={[count]} onValueChange={([v]) => { setCount(v); setCountRaw(String(v)); }} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setVersion((v) => v + 1)}>Regenerate</Button>
          {output && <CopyButton text={output} withLabel />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={version}
          className="flex-1 min-h-0"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            readOnly
            value={output}
            className="h-full resize-none text-sm font-mono"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
