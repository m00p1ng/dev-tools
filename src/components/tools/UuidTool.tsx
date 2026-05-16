import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolSidebarLayout, ToolSidebar } from "@/components/ui/tool-layout";
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, v7 as uuidv7 } from "uuid";
import { ulid } from "ulid";
import { motion, AnimatePresence } from "framer-motion";

type Algorithm = "v1" | "v3" | "v4" | "v5" | "v7" | "ulid" | "objectid";

const ALGORITHM_LABELS: Record<Algorithm, string> = {
  v1: "UUID v1",
  v3: "UUID v3",
  v4: "UUID v4",
  v5: "UUID v5",
  v7: "UUID v7",
  ulid: "ULID",
  objectid: "ObjectId",
};

const NAMESPACES: Record<string, string> = {
  DNS: uuidv5.DNS,
  URL: uuidv5.URL,
};

let _oidCounter = Math.floor(Math.random() * 0xffffff);
function generateObjectId(): string {
  const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  _oidCounter = (_oidCounter + 1) & 0xffffff;
  return ts + rnd + _oidCounter.toString(16).padStart(6, "0");
}

const listVariants = { visible: { transition: { staggerChildren: 0.04 } } };
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } },
};

export function UuidTool() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("v4");
  const [count, setCount] = useState(1);
  const [countRaw, setCountRaw] = useState("1");
  const [namespace, setNamespace] = useState("DNS");
  const [customNamespace, setCustomNamespace] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState(0);

  const needsNameInput = algorithm === "v3" || algorithm === "v5";

  const resolvedNamespace = namespace === "custom" ? customNamespace : (NAMESPACES[namespace] ?? uuidv5.DNS);

  const results = useMemo(() => {
    void version;
    function generateOne(): string {
      switch (algorithm) {
        case "v1": return uuidv1();
        case "v3": return uuidv3(name || " ", resolvedNamespace);
        case "v4": return uuidv4();
        case "v5": return uuidv5(name || " ", resolvedNamespace);
        case "v7": return uuidv7();
        case "ulid": return ulid();
        case "objectid": return generateObjectId();
      }
    }
    return Array.from({ length: count }, generateOne);
  }, [algorithm, count, resolvedNamespace, name, version]);

  return (
    <ToolSidebarLayout>
      <ToolSidebar>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Algorithm</p>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {(Object.keys(ALGORITHM_LABELS) as Algorithm[]).map((a) => (
              <option key={a} value={a}>{ALGORITHM_LABELS[a]}</option>
            ))}
          </select>
        </div>

        {needsNameInput && (
          <>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Namespace</p>
              <select
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DNS">DNS</option>
                <option value="URL">URL</option>
                <option value="custom">Custom</option>
              </select>
              {namespace === "custom" && (
                <Input
                  placeholder="Namespace UUID"
                  value={customNamespace}
                  onChange={(e) => setCustomNamespace(e.target.value)}
                  className="h-8 text-sm font-mono"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Name</p>
              <Input
                placeholder="Enter name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </>
        )}

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
          {results.map((id, i) => (
            <motion.div key={i} variants={itemVariants}>
              <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors">
                <span className="font-mono text-sm flex-1 break-all select-all">{id}</span>
                <CopyButton text={id} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </ToolSidebarLayout>
  );
}
