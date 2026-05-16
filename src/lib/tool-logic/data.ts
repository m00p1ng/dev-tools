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

export function formatJson(input: string, mode: JsonFormatMode): ToolResult<string, JsonFormatMeta> {
  if (!input) return { ok: true, value: "", meta: { repaired: false } };
  try {
    return { ok: true, value: stringifyJson(JSON.parse(input), mode), meta: { repaired: false } };
  } catch (initialError) {
    try {
      return { ok: true, value: stringifyJson(JSON.parse(jsonrepair(input)), mode), meta: { repaired: true } };
    } catch {
      return { ok: false, error: errorMessage(initialError, "Invalid JSON") };
    }
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
