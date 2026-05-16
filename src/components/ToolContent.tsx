import { TOOLS } from "@/tools";
import { PlaceholderTool } from "./tools/PlaceholderTool";
import { JsonFormatTool } from "./tools/JsonFormatTool";
import { Base64Tool } from "./tools/Base64Tool";
import { UrlEncodeTool } from "./tools/UrlEncodeTool";
import { UrlParserTool } from "./tools/UrlParserTool";
import { BackslashTool } from "./tools/BackslashTool";
import { JwtTool } from "./tools/JwtTool";
import { UnixTimeTool } from "./tools/UnixTimeTool";
import { UuidTool } from "./tools/UuidTool";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "json-format": JsonFormatTool,
  "base64": Base64Tool,
  "url-encode": UrlEncodeTool,
  "url-parser": UrlParserTool,
  "backslash": BackslashTool,
  "jwt": JwtTool,
  "unix-time": UnixTimeTool,
  "uuid": UuidTool,
};

interface ToolContentProps {
  toolId: string;
}

export function ToolContent({ toolId }: ToolContentProps) {
  const Component = TOOL_COMPONENTS[toolId];
  const tool = TOOLS.find((t) => t.id === toolId) ?? TOOLS[0];

  if (Component) return <Component />;
  return <PlaceholderTool label={tool.label} />;
}
