export type ToolResult<T, M = undefined> =
  | (M extends undefined ? { ok: true; value: T } : { ok: true; value: T; meta: M })
  | { ok: false; error: string };

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
