import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { CopyButton } from "@/components/ui/copy-button";
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { Copy, Plus, Minus, RotateCcw } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import { useToolKeys } from "@/hooks/useToolKeys";
import { motion, AnimatePresence } from "framer-motion";

type UuidVersion = "v1" | "v4" | "v7";

const listVariants = { visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } },
};

export function UuidTool() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [genKey, setGenKey] = useState(0);

  function generate() {
    setUuids(
      Array.from({ length: count }, () => {
        if (version === "v1") return uuidv1();
        if (version === "v7") return uuidv7();
        return uuidv4();
      })
    );
    setGenKey((k) => k + 1);
  }

  useToolKeys({ onSubmit: generate });

  function copyAll() {
    copyToClipboard(uuids.join("\n"));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {(["v1", "v4", "v7"] as UuidVersion[]).map((v) => (
            <Button key={v} size="sm" variant={version === v ? "default" : "outline"}
              onClick={() => setVersion(v)}>
              {v.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="h-8 w-8"
            onClick={() => setCount(Math.max(1, count - 1))}>
            <Minus className="h-3.5 w-3.5" />
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
          <>
            <Button size="sm" variant="outline" onClick={copyAll}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setUuids([])}>
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
          className="flex-1 overflow-auto space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {uuids.map((id) => (
            <motion.div key={id} variants={itemVariants}>
              <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors">
                <Badge variant="outline" className="font-mono text-xs shrink-0">{version}</Badge>
                <span className="font-mono text-sm flex-1 select-all">{id}</span>
                <CopyButton text={id} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
