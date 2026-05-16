export interface Tool {
  id: string;
  label: string;
  description: string;
}

export const TOOLS: Tool[] = [
  { id: "unix-time", label: "Unix Time Converter", description: "Convert between unix timestamps and human-readable dates" },
  { id: "json-format", label: "JSON Format / Validate", description: "Format and validate JSON data" },
  { id: "base64", label: "Base64 Encode/Decode", description: "Encode and decode Base64 strings" },
  { id: "jwt", label: "JWT Debugger", description: "Decode and inspect JSON Web Tokens" },
  { id: "url-encode", label: "URL Encode/Decode", description: "Encode and decode URL components" },
  { id: "url-parser", label: "URL Parser", description: "Parse URLs into their constituent parts" },
  { id: "backslash", label: "Backslash Escape/Unescape", description: "Escape and unescape backslash sequences" },
  { id: "uuid", label: "UUID Generator", description: "Generate UUIDs (v1, v4, v7)" },
  { id: "yaml-to-json", label: "YAML to JSON", description: "Convert YAML to JSON" },
  { id: "json-to-yaml", label: "JSON to YAML", description: "Convert JSON to YAML" },
  { id: "lorem-ipsum", label: "Lorem Ipsum Generator", description: "Generate placeholder text" },
  { id: "qrcode", label: "QR Code Reader/Generator", description: "Generate and read QR codes" },
  { id: "json-to-csv", label: "JSON to CSV", description: "Convert JSON arrays to CSV" },
  { id: "csv-to-json", label: "CSV to JSON", description: "Convert CSV to JSON arrays" },
  { id: "hash", label: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes" },
  { id: "markdown", label: "Markdown Preview", description: "Preview Markdown with syntax highlighting" },
  { id: "cron", label: "Cron Parser", description: "Parse and explain cron expressions" },
  { id: "random-string", label: "Random String Generator", description: "Generate random strings with custom options" },
];
