import type { ToolResult } from "@/lib/tool-logic/result";

export type BinaryMode = "encode" | "decode";
export type BackslashMode = "escape" | "unescape";

function bytesToBinary(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => String.fromCharCode(b)).join("");
}

function binaryToBytes(binary: string): Uint8Array {
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function encodeBase64(input: string): string {
  return btoa(bytesToBinary(new TextEncoder().encode(input)));
}

export function decodeBase64(input: string): string {
  return new TextDecoder().decode(binaryToBytes(atob(input.trim())));
}

export function transformBase64(input: string, mode: BinaryMode): ToolResult<string> {
  if (!input) return { ok: true, value: "" };
  try {
    return { ok: true, value: mode === "encode" ? encodeBase64(input) : decodeBase64(input) };
  } catch {
    return { ok: false, error: mode === "encode" ? "Encoding failed" : "Invalid Base64 string" };
  }
}

export function transformUrlComponent(input: string, mode: BinaryMode): ToolResult<string> {
  if (!input) return { ok: true, value: "" };
  try {
    return { ok: true, value: mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input) };
  } catch {
    return { ok: false, error: mode === "encode" ? "Encoding failed" : "Invalid encoded string" };
  }
}

export function escapeBackslash(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function unescapeBackslash(input: string): string {
  return input
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export function transformBackslash(input: string, mode: BackslashMode): string {
  if (!input) return "";
  return mode === "escape" ? escapeBackslash(input) : unescapeBackslash(input);
}
