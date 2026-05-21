import { lazy, Suspense, type ComponentType } from "react";
import { TOOLS, type ToolId } from "@/tools";
import { PlaceholderTool } from "./tools/PlaceholderTool";

type ToolModule<TName extends string> = Record<TName, ComponentType>;

function lazyTool<TName extends string>(
  importer: () => Promise<ToolModule<TName>>,
  exportName: TName,
) {
  return lazy(async () => ({ default: (await importer())[exportName] }));
}

const TOOL_COMPONENTS: Partial<Record<ToolId, ComponentType>> = {
  "json-format": lazyTool(() => import("./tools/JsonFormatTool"), "JsonFormatTool"),
  "base64": lazyTool(() => import("./tools/Base64Tool"), "Base64Tool"),
  "url-encode": lazyTool(() => import("./tools/UrlEncodeTool"), "UrlEncodeTool"),
  "url-parser": lazyTool(() => import("./tools/UrlParserTool"), "UrlParserTool"),
  "backslash": lazyTool(() => import("./tools/BackslashTool"), "BackslashTool"),
  "jwt": lazyTool(() => import("./tools/JwtTool"), "JwtTool"),
  "unix-time": lazyTool(() => import("./tools/UnixTimeTool"), "UnixTimeTool"),
  "uuid": lazyTool(() => import("./tools/UuidTool"), "UuidTool"),
  "yaml-to-json": lazyTool(() => import("./tools/YamlToJsonTool"), "YamlToJsonTool"),
  "json-to-yaml": lazyTool(() => import("./tools/JsonToYamlTool"), "JsonToYamlTool"),
  "json-to-csv": lazyTool(() => import("./tools/JsonToCsvTool"), "JsonToCsvTool"),
  "csv-to-json": lazyTool(() => import("./tools/CsvToJsonTool"), "CsvToJsonTool"),
  "lorem-ipsum": lazyTool(() => import("./tools/LoremIpsumTool"), "LoremIpsumTool"),
  "hash": lazyTool(() => import("./tools/HashTool"), "HashTool"),
  "mermaid": lazyTool(() => import("./tools/MermaidTool"), "MermaidTool"),
  "cron": lazyTool(() => import("./tools/CronTool"), "CronTool"),
  "random-string": lazyTool(() => import("./tools/RandomStringTool"), "RandomStringTool"),
  "qrcode": lazyTool(() => import("./tools/QrCodeTool"), "QrCodeTool"),
  "color-picker": lazyTool(() => import("./tools/ColorPickerTool"), "ColorPickerTool"),
};

interface ToolContentProps {
  toolId: string;
}

function LoadingTool() {
  return <div className="h-full rounded-md border border-border bg-muted/20" />;
}

export function ToolContent({ toolId }: ToolContentProps) {
  const Component = TOOL_COMPONENTS[toolId];
  const tool = TOOLS.find((item) => item.id === toolId) ?? TOOLS[0];

  if (!Component) return <PlaceholderTool label={tool.label} />;

  return (
    <Suspense fallback={<LoadingTool />}>
      <Component />
    </Suspense>
  );
}
