import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function UnixTimeTool() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [tsError, setTsError] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const parsedFromTs = (() => {
    const ms = Number(timestamp);
    if (isNaN(ms)) return null;
    const d = timestamp.length >= 13 ? dayjs(ms) : dayjs.unix(ms);
    return d.isValid() ? d : null;
  })();

  const parsedFromDate = dayjs(dateInput, "YYYY-MM-DD HH:mm:ss", true);

  function handleTimestampChange(val: string) {
    setTimestamp(val);
    const ms = Number(val);
    if (isNaN(ms) || val === "") { setTsError("Invalid number"); return; }
    const d = val.length >= 13 ? dayjs(ms) : dayjs.unix(ms);
    if (!d.isValid()) { setTsError("Out of range"); return; }
    setTsError("");
  }

  function handleDateChange(val: string) {
    setDateInput(val);
    const d = dayjs(val);
    if (!d.isValid()) { setDateError("Invalid date"); return; }
    setDateError("");
  }

  function convertDateToTs() {
    if (!parsedFromDate.isValid()) return;
    setTimestamp(String(parsedFromDate.unix()));
    setTsError("");
  }

  function reset() {
    const n = Math.floor(Date.now() / 1000);
    setTimestamp(String(n));
    setDateInput(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    setTsError("");
    setDateError("");
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto">
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">Current Unix Timestamp</p>
        <p className="font-mono text-2xl font-semibold">{now}</p>
        <p className="text-xs text-muted-foreground mt-1">{dayjs.unix(now).format("YYYY-MM-DD HH:mm:ss")} local</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Unix Timestamp → Date</p>
        <div className="flex gap-2">
          <Input
            value={timestamp}
            onChange={(e) => handleTimestampChange(e.target.value)}
            placeholder="1700000000"
            className="font-mono text-sm"
          />
          <Button size="sm" variant="outline" onClick={() => setTimestamp(String(now))}>Now</Button>
        </div>
        {tsError && <Badge variant="destructive" className="text-xs">{tsError}</Badge>}
        {parsedFromTs && !tsError && (
          <div className="text-sm space-y-1 pl-1">
            <p><span className="text-muted-foreground w-16 inline-block">Local:</span> {parsedFromTs.format("YYYY-MM-DD HH:mm:ss")}</p>
            <p><span className="text-muted-foreground w-16 inline-block">UTC:</span> {parsedFromTs.utc().format("YYYY-MM-DD HH:mm:ss")} UTC</p>
            <p><span className="text-muted-foreground w-16 inline-block">ISO:</span> {parsedFromTs.toISOString()}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Date → Unix Timestamp</p>
        <div className="flex gap-2">
          <Input
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
            className="font-mono text-sm"
          />
          <Button size="sm" onClick={convertDateToTs} disabled={!parsedFromDate.isValid()}>Convert</Button>
        </div>
        {dateError && <Badge variant="destructive" className="text-xs">{dateError}</Badge>}
        {parsedFromDate.isValid() && !dateError && (
          <p className="text-sm pl-1">
            <span className="text-muted-foreground">Unix: </span>
            <span className="font-mono">{parsedFromDate.unix()}</span>
          </p>
        )}
      </div>
    </div>
  );
}
