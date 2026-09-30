# Dev Tools — Agent Guide

## Project

Dev Tools is a local-first collection of browser-based developer utilities.
It uses React 19, TypeScript, Vite 7, Tailwind CSS 4, and Vitest with
Playwright browser tests.

## Commands

Always prefix shell commands with `rtk` (see `~/.codex/RTK.md`).

```bash
rtk bun run dev
rtk bun run typecheck
rtk bun run lint
rtk bun run test
rtk bun run test:coverage
rtk bun run build
```

Use `bun run test`, not `bun test`: Bun reserves `bun test` for its native
test runner, while this project's `test` script runs `vitest run`.

Run the narrowest relevant check while iterating; run typecheck, lint, and
the affected tests before handing off a change. Browser tests run headlessly
in Chromium through Playwright.

## Repository map

- `src/App.tsx` — application shell, navigation state, and URL behavior.
- `src/tools.tsx` — canonical tool metadata: id, label, description, icon,
  color, and category.
- `src/components/ToolContent.tsx` — lazy registry that maps each tool id to
  its component.
- `src/components/tools/` — individual tools; complex tools may use a folder.
- `src/components/tools/shared/` — reusable tool-level components.
- `src/components/ui/` — shared UI primitives.
- `src/lib/tool-logic/` — pure, reusable domain logic by tool category.
- `src/hooks/` — reusable React hooks.
- `src/**/__tests__/` — co-located unit and browser tests.

## Adding or changing a tool

1. Put the UI in `src/components/tools/`, exporting a named component.
2. Add the tool metadata in `src/tools.tsx`.
3. Register it as a lazy import in `src/components/ToolContent.tsx`.
4. Keep transformation/parsing logic in `src/lib/tool-logic/` when it can be
   pure and independently tested.
5. Add a co-located `*.browser.test.tsx` for UI behavior and `*.test.ts` for
   pure logic.

Tool ids are URL- and persisted-settings-facing identifiers: treat a rename as
a compatibility change.

## Code conventions

- Use TypeScript and the `@/` alias for imports from `src`.
- Prefer named exports; match the existing component and hook conventions.
- Keep components focused, accessible, and keyboard-operable. Use semantic
  controls and labels instead of click handlers on generic elements.
- Preserve the local-first model: do not add server calls, telemetry, or data
  collection without explicit approval.
- Follow existing Tailwind and shared-UI patterns before introducing new
  styling abstractions or dependencies.
- Do not weaken type checking, lint rules, or tests to make a change pass.

## Testing

- `*.test.ts` runs in the Node Vitest project and is for pure logic.
- `*.browser.test.tsx` runs in the Playwright/Chromium Vitest project and is
  for React rendering and interaction.
- Test visible behavior and user interactions, including error states, rather
  than implementation details.
- Add coverage for a bug fix when practical.

## Working agreement

- Inspect `git status` before editing and preserve unrelated user changes.
- Keep diffs small and scoped; do not reformat unrelated files.
- Do not commit, push, install dependencies, or change project configuration
  unless the user asks.
