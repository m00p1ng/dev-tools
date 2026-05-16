import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(relativeTime);

export function UnixTimeTool() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const parsedDate = (() => {
    if (!input.trim()) return null;

    // Check if it's a numeric timestamp
    if (/^\d+$/.test(input.trim())) {
      const num = Number(input.trim());
      // Heuristic: if it's more than 12 digits, assume milliseconds
      const d = input.trim().length >= 12 ? dayjs(num) : dayjs.unix(num);
      return d.isValid() ? d : null;
    }

    // Try parsing as date string
    const d = dayjs(input.trim());
    return d.isValid() ? d : null;
  })();

  const error = input.trim() && !parsedDate ? "Invalid input format" : "";

  const formatWithGmt = (d: dayjs.Dayjs) => {
    const offset = d.utcOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";
    const offsetStr = minutes === 0 ? `${sign}${hours}` : `${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
    return d.format("YYYY-MM-DD HH:mm:ss") + ` (GMT ${offsetStr})`;
  };

  const localTimeValue = parsedDate ? formatWithGmt(parsedDate) : "";

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto">
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">Current Unix Timestamp</p>
        <p className="font-mono text-2xl font-semibold">{now}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatWithGmt(dayjs.unix(now))}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Input (Unix Timestamp or Date)</p>
          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setInput(String(now))}>Now</Button>
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 1700000000 or 2023-11-15T12:00:00Z"
            className="font-mono text-sm"
          />
        </div>
        {error && <Badge variant="destructive" className="text-xs">{error}</Badge>}
        
        {parsedDate && !error && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "Unix (s)", value: parsedDate.unix().toString(), mono: true },
              { label: "Unix (ms)", value: parsedDate.valueOf().toString(), mono: true },
              { label: "Local Time", value: localTimeValue },
              { label: "UTC Time", value: parsedDate.utc().format("YYYY-MM-DD HH:mm:ss") + " UTC" },
              { label: "Relative", value: parsedDate.fromNow() },
              { label: "ISO 8601", value: parsedDate.toISOString(), truncate: true, fullWidth: true },
            ].map((item: any) => (
              <div 
                key={item.label} 
                className={`rounded-lg border border-border bg-card p-3 space-y-1 shadow-sm ${item.fullWidth ? "col-span-2" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
                <p className={`text-sm font-medium ${item.mono ? "font-mono" : ""} ${item.truncate ? "truncate" : ""}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

