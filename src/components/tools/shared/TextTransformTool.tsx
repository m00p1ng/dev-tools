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

type PerMode<TMode extends string, T> = T | ((mode: TMode) => T);

function resolvePerMode<TMode extends string, T>(value: PerMode<TMode, T>, mode: TMode): T {
  return typeof value === "function" ? (value as (mode: TMode) => T)(mode) : value;
}

interface TextTransformToolProps<TMode extends string, M> {
  storageKey: string;
  initialMode: TMode;
  modes?: ModeOption<TMode>[];
  inputPlaceholder: PerMode<TMode, string>;
  outputPlaceholder: string;
  example: PerMode<TMode, string>;
  transform: (input: string, mode: TMode) => TextTransformResult<M>;
  outputLanguage?: PerMode<TMode, string>;
  gap?: 1 | 2;
  adoptOutputOnModeChange?: boolean;
  toolbarLeft?: PerMode<TMode, React.ReactNode>;
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

  const resolvedExample = resolvePerMode(example, mode);
  const resolvedInputPlaceholder = resolvePerMode(inputPlaceholder, mode);
  const resolvedOutputLanguage = resolvePerMode(outputLanguage ?? "text", mode);
  const resolvedToolbarLeft = resolvePerMode(toolbarLeft, mode);

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
      <ToolPanels>
        <ToolPane gap={gap}>
          <ToolToolbar
            left={
              <>
                {modeButtons}
                {resolvedToolbarLeft}
              </>
            }
            onExample={() => setInput(resolvedExample)}
            onClear={() => setInput("")}
          />
          <Textarea
            placeholder={resolvedInputPlaceholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: start, selectionEnd: end } = el;
              const next = input.slice(0, start) + "  " + input.slice(end);
              setInput(next);
              requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
            }}
            className={cn(
              "flex-1 resize-none font-mono transition-all duration-150",
              isDragging && "ring-2 ring-primary/50 bg-primary/5",
            )}
            {...dropProps}
          />
        </ToolPane>
        <ToolOutputPane
          gap={gap}
          header={
            <div className="flex w-full items-center justify-between">
              <div>{meta ? renderMeta?.(meta) : null}</div>
              {output && <CopyButton text={output} />}
            </div>
          }
        >
          <div className="relative flex-1 min-h-0">
            <Suspense
              fallback={
                <div className="h-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-muted-foreground">
                  {outputPlaceholder}
                </div>
              }
            >
              <CodeBlock code={output} language={resolvedOutputLanguage} placeholder={outputPlaceholder} />
            </Suspense>
          </div>
        </ToolOutputPane>
      </ToolPanels>
    </ToolLayout>
  );
}
