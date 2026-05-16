import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";

dayjs.extend(utc);
dayjs.extend(relativeTime);

const listVariants = { visible: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export function UnixTimeTool() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const parsedDate = (() => {
    if (!input.trim()) return null;
    if (/^\d+$/.test(input.trim())) {
      const num = Number(input.trim());
      const d = input.trim().length >= 12 ? dayjs(num) : dayjs.unix(num);
      return d.isValid() ? d : null;
    }
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
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">Current Unix Timestamp</p>
          <CopyButton text={String(now)} />
        </div>
        <p className="font-mono text-2xl font-semibold">{now}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatWithGmt(dayjs.unix(now))}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Input (Unix Timestamp or Date)</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setInput(String(now))}>Now</Button>
          </div>
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 1700000000 or 2023-11-15T12:00:00Z"
          className="font-mono text-sm"
        />
        {error && <Badge variant="destructive" className="text-xs">{error}</Badge>}

        {parsedDate && !error && (
          <motion.div
            className="grid grid-cols-2 gap-3 mt-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: "Unix (s)", value: parsedDate.unix().toString(), mono: true },
              { label: "Unix (ms)", value: parsedDate.valueOf().toString(), mono: true },
              { label: "Local Time", value: localTimeValue },
              { label: "UTC Time", value: parsedDate.utc().format("YYYY-MM-DD HH:mm:ss") + " UTC" },
              { label: "Relative", value: parsedDate.fromNow() },
              { label: "ISO 8601", value: parsedDate.toISOString(), truncate: true },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className={`group rounded-lg border border-border bg-card p-3 space-y-1 shadow-sm hover:border-border/60 transition-colors ${(item as { fullWidth?: boolean }).fullWidth ? "col-span-2" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
                  <CopyButton text={item.value} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className={`text-sm font-medium ${item.mono ? "font-mono" : ""} ${(item as { truncate?: boolean }).truncate ? "truncate" : ""}`}>
                  {item.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
