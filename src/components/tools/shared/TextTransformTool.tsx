import { lazy, Suspense, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout, ToolOutputPane, ToolPane, ToolPanels, ToolToolbar } from "@/components/ui/tool-layout";
import { useDropText } from "@/hooks/useDropText";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import type { ToolResult } from "@/lib/tool-logic/result";

const CodeBlock = lazy(async () => ({ default: (await import("@/components/ui/code-block")).CodeBlock }));

type TextTransformResult<M> = string | ToolResult<string, M>;

interface TransformState<M> {
  output: string;
  error: string;
  meta: M | null;
}

interface ModeOption<TMode extends string> {
  value: TMode;
  label: string;
}

interface TextTransformToolProps<TMode extends string, M> {
  storageKey: string;
  initialMode: TMode;
  modes?: ModeOption<TMode>[];
  inputPlaceholder: string;
  outputPlaceholder: string;
  example: string;
  transform: (input: string, mode: TMode) => TextTransformResult<M>;
  outputLanguage?: string;
  gap?: 1 | 2;
  adoptOutputOnModeChange?: boolean;
  toolbarLeft?: React.ReactNode;
  renderMeta?: (meta: M) => React.ReactNode;
}

function normalizeResult<M>(result: TextTransformResult<M>): TransformState<M> {
  if (typeof result === "string") return { output: result, error: "", meta: null };
  if (result.ok) return { output: result.value, error: "", meta: "meta" in result ? result.meta : null };
  return { output: "", error: result.error, meta: null };
}

export function TextTransformTool<TMode extends string = "default", M = undefined>({
  storageKey,
  initialMode,
  modes,
  inputPlaceholder,
  outputPlaceholder,
  example,
  transform,
  outputLanguage,
  gap = 2,
  adoptOutputOnModeChange = false,
  toolbarLeft,
  renderMeta,
}: TextTransformToolProps<TMode, M>) {
  const [input, setInput] = useLocalStorage(storageKey, "");
  const [mode, setMode] = useState(initialMode);
  const { isDragging, dropProps } = useDropText(setInput);

  const { output, error, meta } = useMemo(() => normalizeResult(transform(input, mode)), [input, mode, transform]);

  const modeButtons = modes?.map((option) => (
    <Button
      key={option.value}
      size="sm"
      variant={mode === option.value ? "default" : "outline"}
      onClick={() => {
        setMode(option.value);
        if (adoptOutputOnModeChange && output) setInput(output);
      }}
    >
      {option.label}
    </Button>
  ));

  return (
    <ToolLayout>
      {error && <Badge variant="destructive" className="self-start text-xs">{error}</Badge>}
      {meta && renderMeta?.(meta)}
      <ToolPanels>
        <ToolPane gap={gap}>
          <ToolToolbar
            left={
              <>
                {modeButtons}
                {toolbarLeft}
              </>
            }
            onExample={() => setInput(example)}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder={inputPlaceholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className={cn(
              "flex-1 resize-none font-mono text-xs transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5",
            )}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane gap={gap}>
          <div className="relative flex-1 min-h-0">
            {outputLanguage ? (
              <Suspense
                fallback={
                  <div className="h-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-muted-foreground">
                    {outputPlaceholder}
                  </div>
                }
              >
                <CodeBlock code={output} language={outputLanguage} placeholder={outputPlaceholder} />
              </Suspense>
            ) : (
              <>
                <Textarea
                  readOnly
                  value={output}
                  placeholder={outputPlaceholder}
                  className="h-full resize-none font-mono text-xs"
                />
                {output && <CopyButton text={output} className="absolute right-2 top-2" />}
              </>
            )}
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
