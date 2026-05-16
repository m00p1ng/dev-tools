import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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

export function UrlParserTool() {
  const [input, setInput] = useLocalStorage("tool:url-parser", "");
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState("");

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
      <div className="flex gap-2 items-center">
        <Input
          placeholder="https://example.com/path?foo=bar&baz=qux#section"
          value={input}
          onChange={(e) => parse(e.target.value)}
          className="font-mono text-xs"
        />
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground shrink-0"
          onClick={() => parse("https://user:pass@example.com:8080/api/v1/users?role=admin&active=true#results")}>
          Example
        </Button>
      </div>

      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}

      {parsed && (
        <div className="space-y-3 overflow-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-border">
                  <td className="py-2 pr-4 font-medium text-muted-foreground w-24">{label}</td>
                  <td className="py-2 font-mono text-xs break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {parsed.params.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Query Parameters</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1.5 text-left font-medium text-muted-foreground">Key</th>
                    <th className="py-1.5 text-left font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.params.map(([k, v]) => (
                    <tr key={k} className="border-b border-border">
                      <td className="py-1.5 pr-4 font-mono text-xs">{k}</td>
                      <td className="py-1.5 font-mono text-xs break-all">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
