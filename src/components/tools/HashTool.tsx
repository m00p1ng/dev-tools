import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolLayout, ToolPanels, ToolPane, ToolOutputPane, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CryptoJS from "crypto-js";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
type Algo = typeof ALGOS[number];

const listVariants = {
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export function HashTool() {
  const [input, setInput] = useLocalStorage("tool:hash", "");
  const [encoding, setEncoding] = useState<"hex" | "base64">("hex");
  const { isDragging, dropProps } = useDropText(setInput);

  const results: Record<Algo, string> = {} as Record<Algo, string>;
  if (input) {
    for (const algo of ALGOS) {
      const wordArray = (() => {
        switch (algo) {
          case "MD5": return CryptoJS.MD5(input);
          case "SHA-1": return CryptoJS.SHA1(input);
          case "SHA-256": return CryptoJS.SHA256(input);
          case "SHA-512": return CryptoJS.SHA512(input);
        }
      })();
      results[algo] = encoding === "base64"
        ? wordArray.toString(CryptoJS.enc.Base64)
        : wordArray.toString(CryptoJS.enc.Hex);
    }
  }

  return (
    <ToolLayout>
      <ToolPanels>
        <ToolPane>
          <ToolToolbar
            left={
              (["hex", "base64"] as const).map((enc) => (
                <Button key={enc} size="sm" variant={encoding === enc ? "default" : "outline"}
                  onClick={() => setEncoding(enc)}>
                  {enc}
                </Button>
              ))
            }
            onExample={() => setInput("Hello, World!")}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder="Enter text to hash… or drop a file"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn("flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5")}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane>
          <AnimatePresence mode="wait">
            <motion.div
              key={encoding + (input ? "data" : "empty")}
              className="flex-1 overflow-auto space-y-2"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {ALGOS.map((algo) => (
                <motion.div key={algo} variants={itemVariants}>
                  <div className="rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">{algo}</Badge>
                      {input && <CopyButton text={results[algo]} />}
                    </div>
                    <p className="font-mono text-sm break-all text-muted-foreground">
                      {input ? results[algo] : "—"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
