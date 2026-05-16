import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import { CopyButton } from "@/components/ui/copy-button";
import { RotateCcw } from "lucide-react";
import { LoremIpsum } from "lorem-ipsum";
import { useToolKeys } from "@/hooks/useToolKeys";
import { motion, AnimatePresence } from "framer-motion";

const lorem = new LoremIpsum();

type Unit = "words" | "sentences" | "paragraphs";

export function LoremIpsumTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [genKey, setGenKey] = useState(0);

  function generate() {
    const result =
      unit === "words"
        ? lorem.generateWords(count)
        : unit === "sentences"
          ? lorem.generateSentences(count)
          : lorem.generateParagraphs(count);
    setOutput(result);
    setGenKey((k) => k + 1);
  }

  useToolKeys({ onSubmit: generate });

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["words", "sentences", "paragraphs"] as Unit[]).map((u) => (
            <Button key={u} size="sm" variant={unit === u ? "default" : "outline"} onClick={() => setUnit(u)}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </Button>
          ))}
        </div>

        <Input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
          className="w-20 h-8 text-sm text-center"
        />

        <Button size="sm" onClick={generate}>Generate</Button>

        {output && (
          <>
            <CopyButton text={output} withLabel />
            <Button size="sm" variant="ghost" onClick={() => setOutput("")}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <Kbd>⌘↵</Kbd> generate
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={genKey}
          className="flex-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            readOnly
            value={output}
            placeholder="Generated text will appear here..."
            className="h-full resize-none text-sm"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
