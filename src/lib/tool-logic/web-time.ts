import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import type { ToolResult } from "@/lib/tool-logic/result";
import { errorMessage } from "@/lib/tool-logic/result";

dayjs.extend(utc);
dayjs.extend(relativeTime);

export interface ParsedUrl {
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: [string, string][];
}

export function parseUrl(input: string): ToolResult<ParsedUrl> {
  if (!input) return { ok: false, error: "Invalid URL" };
  try {
    const url = new URL(input);
    const params: [string, string][] = [];
    url.searchParams.forEach((value, key) => params.push([key, value]));
    return {
      ok: true,
      value: {
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        params,
      },
    };
  } catch {
    return { ok: false, error: "Invalid URL" };
  }
}

export interface CronParseResult {
  description: string;
  nextRuns: Date[];
}

export function parseCronExpression(input: string, currentDate?: Date): ToolResult<CronParseResult> {
  try {
    const description = cronstrue.toString(input, { throwExceptionOnParseError: true });
    const interval = CronExpressionParser.parse(input, currentDate ? { currentDate } : undefined);
    return {
      ok: true,
      value: {
        description,
        nextRuns: Array.from({ length: 5 }, () => interval.next().toDate()),
      },
    };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Invalid cron expression") };
  }
}

export function parseUnixInput(input: string): dayjs.Dayjs | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const value = Number(trimmed);
    const date = trimmed.length >= 12 ? dayjs(value) : dayjs.unix(value);
    return date.isValid() ? date : null;
  }
  const date = dayjs(trimmed);
  return date.isValid() ? date : null;
}

export function formatWithGmt(date: dayjs.Dayjs): string {
  const offset = date.utcOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  const offsetStr = minutes === 0 ? `${sign}${hours}` : `${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
  return date.format("YYYY-MM-DD HH:mm:ss") + ` (GMT ${offsetStr})`;
}
