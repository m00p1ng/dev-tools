import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw } from "lucide-react";
import { copyToClipboard } from "@/lib/copy";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum();

type Unit = "words" | "sentences" | "paragraphs";

export function LoremIpsumTool() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");

  function generate() {
    const result =
      unit === "words"
        ? lorem.generateWords(count)
        : unit === "sentences"
          ? lorem.generateSentences(count)
          : lorem.generateParagraphs(count);
    setOutput(result);
  }

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
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(output)}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOutput("")}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      <Textarea
        readOnly
        value={output}
        placeholder="Generated text will appear here..."
        className="flex-1 resize-none text-sm"
      />
    </div>
  );
}
