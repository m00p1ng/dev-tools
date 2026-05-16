import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParsedUrl {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: [string, string][];
}

const listVariants = { visible: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 350, damping: 28 } },
};

export function UrlParserTool() {
  const [input, setInput] = useLocalStorage("tool:url-parser", "");
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState("");
  const { isDragging, dropProps } = useDropText((text) => parse(text.trim()));

  function parse(val: string) {
    setInput(val);
    try {
      const u = new URL(val);
      const params: [string, string][] = [];
      u.searchParams.forEach((v, k) => params.push([k, v]));
      setParsed({
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
      });
      setError("");
    } catch {
      setParsed(null);
      if (val) setError("Invalid URL");
      else setError("");
    }
  }

  const rows: [string, string][] = parsed
    ? [
        ["Protocol", parsed.protocol],
        ["Host", parsed.host],
        ["Hostname", parsed.hostname],
        ["Port", parsed.port || "(default)"],
        ["Path", parsed.pathname],
        ["Query", parsed.search || "(none)"],
        ["Hash", parsed.hash || "(none)"],
      ]
    : [];

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="https://example.com/path?foo=bar&baz=qux#section"
          value={input}
          onChange={(e) => parse(e.target.value)}
          rows={3}
          className={cn("font-mono text-xs resize-none transition-all duration-150",
            isDragging && "ring-2 ring-primary/50 bg-primary/5")}
          {...dropProps}
        />
        <Button size="sm" variant="ghost" className="shrink-0" onClick={() => parse("")}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground shrink-0"
          onClick={() => parse("https://user:pass@example.com:8080/api/v1/users?role=admin&active=true#results")}>
          Example
        </Button>
      </div>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      {parsed && (
        <div className="space-y-3 overflow-auto">
          <motion.table
            className="w-full text-sm"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <tbody>
              {rows.map(([label, value]) => (
                <motion.tr key={label} variants={itemVariants} className="group border-b border-border">
                  <td className="py-2 pr-4 font-medium text-muted-foreground w-24">{label}</td>
                  <td className="py-2 font-mono text-xs break-all flex-1">{value}</td>
                  <td className="py-2 w-8">
                    <CopyButton text={value} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>

          {parsed.params.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Query Parameters</p>
              <motion.table
                className="w-full text-sm"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1.5 text-left font-medium text-muted-foreground">Key</th>
                    <th className="py-1.5 text-left font-medium text-muted-foreground">Value</th>
                    <th className="py-1.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {parsed.params.map(([k, v]) => (
                    <motion.tr key={k} variants={itemVariants} className="group border-b border-border">
                      <td className="py-1.5 pr-4 font-mono text-xs">{k}</td>
                      <td className="py-1.5 font-mono text-xs break-all">{v}</td>
                      <td className="py-1.5">
                        <CopyButton text={v} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
