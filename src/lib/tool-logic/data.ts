import Papa from "papaparse";
import yaml from "js-yaml";
import { jsonrepair } from "jsonrepair";
import type { ToolResult } from "@/lib/tool-logic/result";
import { errorMessage } from "@/lib/tool-logic/result";

export type JsonFormatMode = "format" | "minify";

export interface JsonFormatMeta {
  repaired: boolean;
}

function stringifyJson(value: unknown, mode: JsonFormatMode): string {
  return mode === "minify" ? JSON.stringify(value) : JSON.stringify(value, null, 2);
}

function parseJsonOrRepair(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return JSON.parse(jsonrepair(input));
  }
}

function parseConcatenatedJsonValues(input: string): unknown[] | null {
  const values: unknown[] = [];
  let segmentStart: number | null = null;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (segmentStart === null) {
      if (char === " " || char === "\t" || char === "\n" || char === "\r") {
        continue;
      }

      if (char !== "{" && char !== "[") {
        return null;
      }

      segmentStart = index;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{" || char === "[") {
      depth += 1;
    } else if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) {
        values.push(parseJsonOrRepair(input.slice(segmentStart, index + 1)));
        segmentStart = null;
      } else if (depth < 0) {
        return null;
      }
    }
  }

  if (segmentStart !== null || inString || values.length < 2) return null;
  return values;
}

function tryParseJson(input: string): { value: unknown; repaired: boolean } {
  try {
    return {
      value: JSON.parse(input),
      repaired: false,
    };
  } catch {
    const concatenated = parseConcatenatedJsonValues(input);
    if (concatenated) {
      return {
        value: concatenated,
        repaired: true,
      };
    }
    return {
      value: parseJsonOrRepair(input),
      repaired: true,
    };
  }
}

export function formatJson(input: string, mode: JsonFormatMode): ToolResult<string, JsonFormatMeta> {
  if (!input) return { ok: true, value: "", meta: { repaired: false } };
  try {
    const { value, repaired } = tryParseJson(input);
    return {
      ok: true,
      value: stringifyJson(value, mode),
      meta: { repaired },
    };
  } catch (error) {
    return {
      ok: false,
      error: errorMessage(error, "Invalid JSON"),
    };
  }
}

export function yamlToJson(input: string): ToolResult<string> {
  if (!input) return { ok: true, value: "" };
  try {
    return { ok: true, value: JSON.stringify(yaml.load(input), null, 2) ?? "" };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Invalid YAML") };
  }
}

export function jsonToYaml(input: string): ToolResult<string> {
  if (!input) return { ok: true, value: "" };
  try {
    return { ok: true, value: yaml.dump(JSON.parse(input), { indent: 2 }) };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Invalid JSON") };
  }
}

export function csvToJson(input: string, header: boolean): ToolResult<string> {
  if (!input.trim()) return { ok: true, value: "" };
  const result = Papa.parse(input.trim(), { header, skipEmptyLines: true, dynamicTyping: true });
  if (result.errors.length) return { ok: false, error: result.errors[0].message };
  return { ok: true, value: JSON.stringify(result.data, null, 2) };
}

export function jsonToCsv(input: string): ToolResult<string> {
  if (!input) return { ok: true, value: "" };
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) return { ok: false, error: "Input must be a JSON array" };
    return { ok: true, value: Papa.unparse(parsed) };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Invalid JSON") };
  }
}
