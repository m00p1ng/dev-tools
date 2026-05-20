import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ToolLayout, ToolToolbar } from "@/components/ui/tool-layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDropText } from "@/hooks/useDropText";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { parseUrl, type ParsedUrl } from "@/lib/tool-logic/web-time";

const listVariants = { visible: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 350, damping: 28 } },
};

const paramColors = [
  "text-rose-500 dark:text-rose-400",
  "text-amber-500 dark:text-amber-400",
  "text-emerald-500 dark:text-emerald-400",
  "text-cyan-500 dark:text-cyan-400",
  "text-violet-500 dark:text-violet-400",
];

function buildHighlight(raw: string): React.ReactNode {
  try {
    const u = new URL(raw.trim());
    const muted = "text-muted-foreground";
    const nodes: React.ReactNode[] = [];

    nodes.push(<span key="proto" className="text-blue-500 dark:text-blue-400">{u.protocol}</span>);
    nodes.push(<span key="slashes" className={muted}>//</span>);

    if (u.username) {
      nodes.push(<span key="user" className="text-orange-500 dark:text-orange-400">{u.username}</span>);
      if (u.password) {
        nodes.push(<span key="colon-pass" className={muted}>:</span>);
        nodes.push(<span key="pass" className="text-orange-400 dark:text-orange-300">{u.password}</span>);
      }
      nodes.push(<span key="at" className={muted}>@</span>);
    }

    nodes.push(<span key="hostname" className="text-green-500 dark:text-green-400">{u.hostname}</span>);

    const rawHasColon = raw.trim().slice(raw.indexOf(u.hostname) + u.hostname.length).startsWith(":");
    if (u.port) {
      nodes.push(<span key="colon-port" className={muted}>:</span>);
      nodes.push(<span key="port" className="text-yellow-500 dark:text-yellow-400">{u.port}</span>);
    } else if (rawHasColon) {
      nodes.push(<span key="colon-port" className={muted}>:</span>);
    }

    const hostWithPort = u.hostname + (u.port ? `:${u.port}` : "");
    if (u.pathname === "/") {
      if (raw.trim().includes(hostWithPort + "/")) {
        nodes.push(<span key="slash" className={muted}>/</span>);
      }
    } else if (u.pathname) {
      nodes.push(<span key="path" className="text-rose-500 dark:text-rose-400">{u.pathname}</span>);
    }

    const rawHasQuery = raw.trim().includes("?");
    if (rawHasQuery || u.search) {
      nodes.push(<span key="q" className={muted}>?</span>);
      if (u.search) {
        u.search.slice(1).split("&").forEach((pair, i) => {
          if (i > 0) nodes.push(<span key={`amp-${i}`} className={muted}>&</span>);
          if (!pair) return;
          const [k, ...rest] = pair.split("=");
          const v = rest.join("=");
          nodes.push(<span key={`pk-${i}`} className="text-amber-500 dark:text-amber-400">{k}</span>);
          if (rest.length > 0) {
            nodes.push(<span key={`peq-${i}`} className={muted}>=</span>);
            nodes.push(<span key={`pv-${i}`} className="text-amber-500/75 dark:text-amber-400/75">{v}</span>);
          }
        });
      }
    }

    if (u.hash || raw.trim().includes("#")) {
      nodes.push(<span key="hash-sym" className={muted}>#</span>);
      if (u.hash) nodes.push(<span key="hash" className="text-teal-500 dark:text-teal-400">{u.hash.slice(1)}</span>);
    }

    return nodes;
  } catch {
    return <span className="text-foreground">{raw}</span>;
  }
}

export function UrlParserTool() {
  const [input, setInput] = useLocalStorage("tool:url-parser", "");
  const { isDragging, dropProps } = useDropText((text) => setInput(text.trim()));

  const { parsed, error } = useMemo<{ parsed: ParsedUrl | null; error: string }>(() => {
    if (!input) return { parsed: null, error: "" };
    const result = parseUrl(input);
    return result.ok ? { parsed: result.value, error: "" } : { parsed: null, error: result.error };
  }, [input]);

  const rows: [string, React.ReactNode, string, string][] = parsed
    ? [
        ["Protocol", parsed.protocol, "text-blue-500 dark:text-blue-400", parsed.protocol],
        ...(parsed.username ? [["Username", parsed.username, "text-orange-500 dark:text-orange-400", parsed.username] as [string, React.ReactNode, string, string]] : []),
        ...(parsed.password ? [["Password", parsed.password, "text-orange-400 dark:text-orange-300", parsed.password] as [string, React.ReactNode, string, string]] : []),
        ["Host",
          parsed.port
            ? <><span className="text-green-500 dark:text-green-400">{parsed.hostname}</span><span className="text-muted-foreground">:</span><span className="text-yellow-500 dark:text-yellow-400">{parsed.port}</span></>
            : parsed.host,
          parsed.port ? "" : "text-green-500 dark:text-green-400",
          parsed.host],
        ["Hostname", parsed.hostname, "text-green-500 dark:text-green-400", parsed.hostname],
        ["Port", parsed.port || "(default)", "text-yellow-500 dark:text-yellow-400", parsed.port || "(default)"],
        ["Path", parsed.pathname, "text-rose-500 dark:text-rose-400", parsed.pathname],
        ["Query", parsed.search
          ? <><span className="text-muted-foreground">?</span>{parsed.search.slice(1).split("&").map((pair, i) => {
              const [k, ...rest] = pair.split("=");
              const v = rest.join("=");
              return <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground">&</span>}
                {pair && <span className="text-amber-500 dark:text-amber-400">{k}</span>}
                {pair && rest.length > 0 && <><span className="text-muted-foreground">=</span><span className="text-amber-500/75 dark:text-amber-400/75">{v}</span></>}
              </React.Fragment>;
            })}</>
          : "(none)", "", parsed.search || "(none)"],
        ["Hash", parsed.hash
          ? <><span className="text-muted-foreground">#</span><span className="text-teal-500 dark:text-teal-400">{parsed.hash.slice(1)}</span></>
          : "(none)", "", parsed.hash || "(none)"],
      ]
    : ["Protocol", "Host", "Hostname", "Port", "Path", "Query", "Hash"].map(
        (label) => [label, <span className="text-muted-foreground/40">—</span>, "", ""] as [string, React.ReactNode, string, string]
      );

  return (
    <ToolLayout>
      <div className="flex flex-col gap-1">
        <ToolToolbar
          onExample={() => setInput("https://user:pass@example.com:8080/api/v1/users?role=admin&active=true#results")}
          onClear={() => setInput("")}
        />
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-md border border-transparent px-3 py-2 font-mono text-sm leading-6 whitespace-pre-wrap [overflow-wrap:anywhere]"
          >
            {input ? buildHighlight(input) : null}
          </div>
          <textarea
            placeholder="https://example.com/path?foo=bar&baz=qux#section"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
              "relative w-full min-h-[7.5rem] resize-none rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm leading-6 shadow-xs outline-none transition-[color,box-shadow] duration-150 [overflow-wrap:anywhere]",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              input ? "text-transparent caret-foreground" : "text-foreground",
              isDragging && "ring-2 ring-primary/50 bg-primary/5"
            )}
            {...dropProps}
          />
        </div>
      </div>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      {(parsed || (!input && !error)) && (
        <div className="space-y-3 overflow-auto">
          <motion.table
            className="w-full text-sm"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <tbody>
              {rows.map(([label, value, color, copyText]) => (
                <motion.tr key={label} variants={itemVariants} className="group border-b border-border">
                  <td className="py-2 pr-4 font-medium text-muted-foreground w-24">{label}</td>
                  <td className={cn("py-2 font-mono text-sm break-all flex-1", color)}>{value}</td>
                  <td className="py-2 w-8">
                    <CopyButton text={copyText} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>

          {parsed?.params.length > 0 && (
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
                  {parsed.params.map(([k, v], i) => {
                    const color = paramColors[i % paramColors.length];
                    return (
                    <motion.tr key={k} variants={itemVariants} className="group border-b border-border">
                      <td className={cn("py-1.5 pr-4 font-mono text-sm", color)}>{k}</td>
                      <td className={cn("py-1.5 font-mono text-sm break-all opacity-75", color)}>{v}</td>
                      <td className="py-1.5">
                        <CopyButton text={v} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </motion.tr>
                    );
                  })}
                </tbody>
              </motion.table>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
