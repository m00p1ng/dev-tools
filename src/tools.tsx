import {
  AlignLeft,
  Binary,
  Braces,
  Clock,
  Code,
  FileCode,
  FileJson,
  Fingerprint,
  GitFork,
  Globe,
  Hash,
  KeyRound,
  Link,
  Pipette,
  QrCode,
  Shuffle,
  Table,
  TableProperties,
  Timer,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

export interface Tool {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<LucideProps>;
  color: string;
  group: string;
}

export const TOOLS: Tool[] = [
  { id: "unix-time", label: "Unix Time Converter", description: "Convert between unix timestamps and human-readable dates", icon: Clock, color: "text-blue-500", group: "Time" },
  { id: "cron", label: "Cron Parser", description: "Parse and explain cron expressions", icon: Timer, color: "text-fuchsia-500", group: "Time" },

  { id: "json-format", label: "JSON Format / Validate", description: "Format and validate JSON data", icon: Braces, color: "text-yellow-500", group: "Data" },
  { id: "yaml-to-json", label: "YAML to JSON", description: "Convert YAML to JSON", icon: FileJson, color: "text-amber-500", group: "Data" },
  { id: "json-to-yaml", label: "JSON to YAML", description: "Convert JSON to YAML", icon: FileCode, color: "text-lime-500", group: "Data" },
  { id: "json-to-csv", label: "JSON to CSV", description: "Convert JSON arrays to CSV", icon: Table, color: "text-green-500", group: "Data" },
  { id: "csv-to-json", label: "CSV to JSON", description: "Convert CSV to JSON arrays", icon: TableProperties, color: "text-emerald-500", group: "Data" },

  { id: "base64", label: "Base64 Encode/Decode", description: "Encode and decode Base64 strings", icon: Binary, color: "text-purple-500", group: "Encoding" },
  { id: "url-encode", label: "URL Encode/Decode", description: "Encode and decode URL components", icon: Link, color: "text-cyan-500", group: "Encoding" },
  { id: "backslash", label: "Backslash Escape/Unescape", description: "Escape and unescape backslash sequences", icon: Code, color: "text-orange-500", group: "Encoding" },

  { id: "url-parser", label: "URL Parser", description: "Parse URLs into their constituent parts", icon: Globe, color: "text-teal-500", group: "Web" },
  { id: "mermaid", label: "Mermaid Diagram", description: "Render Mermaid diagrams from text", icon: GitFork, color: "text-sky-500", group: "Web" },
  { id: "color-picker", label: "Color Picker", description: "Pick and convert colors between HEX, RGB, HSL, HSV, and OKLCH", icon: Pipette, color: "text-pink-400", group: "Web" },

  { id: "jwt", label: "JWT Debugger", description: "Decode and inspect JSON Web Tokens", icon: KeyRound, color: "text-rose-500", group: "Security" },
  { id: "hash", label: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes", icon: Hash, color: "text-red-500", group: "Security" },

  { id: "uuid", label: "UUID Generator", description: "Generate UUIDs (v1, v4, v7)", icon: Fingerprint, color: "text-indigo-500", group: "Generators" },
  { id: "lorem-ipsum", label: "Lorem Ipsum Generator", description: "Generate placeholder text", icon: AlignLeft, color: "text-pink-500", group: "Generators" },
  { id: "random-string", label: "Random String Generator", description: "Generate random strings with custom options", icon: Shuffle, color: "text-slate-400", group: "Generators" },
  { id: "qrcode", label: "QR Code Reader/Generator", description: "Generate and read QR codes", icon: QrCode, color: "text-violet-500", group: "Generators" },
];

export type ToolId = (typeof TOOLS)[number]["id"];
