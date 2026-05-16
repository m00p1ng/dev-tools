# Plan: Dev Tools Desktop App (Tauri)

## Context
Build a cross-platform desktop developer utilities app using Tauri v2. Replaces juggling browser tabs / online tools with a fast, offline-first native app. 19 tools in a two-pane layout: searchable sidebar + content area.

---

## Decisions Made

| Decision | Choice |
|---|---|
| Frontend | React + TypeScript |
| UI/Styling | shadcn/ui + Tailwind CSS |
| Compute | Pure JS/TS libraries (no Rust backend calls) |
| Theme | Dark + Light + OS auto-detect |
| Platforms | macOS, Windows, Linux |
| Persistence | localStorage (last input per tool) |
| Global hotkey | Cmd+Shift+D (system-wide, Tauri global shortcut plugin) |
| Sidebar | Flat list + live search filter |
| Auto-update | None (add later) |

---

## Stack

```
src-tauri/          Tauri v2 Rust shell
src/
  components/
    Sidebar.tsx
    SearchBox.tsx
    tools/          One file per tool
  hooks/
    useLocalStorage.ts
  App.tsx
  main.tsx
```

**Key JS libs per tool:**

| Tool | Library |
|---|---|
| Unix Time Converter | `dayjs` |
| JSON Format/Validate | built-in `JSON.parse` + `prettier` |
| Base64 Encode/Decode | built-in `btoa`/`atob` |
| JWT Debugger | `jwt-decode` |
| URL Encode/Decode | built-in `encodeURIComponent`/`decodeURIComponent` |
| URL Parser | built-in `URL` constructor |
| Backslash Escape/Unescape | custom regex |
| UUID Generator | `uuid` |
| YAML ↔ JSON | `js-yaml` |
| Lorem Ipsum | `lorem-ipsum` |
| QR Code Reader/Generator | `qrcode` (gen) + `html5-qrcode` (read) |
| JSON ↔ CSV | `papaparse` |
| Hash Generator | `crypto-js` |
| Markdown Preview | `react-markdown` + `rehype-highlight` |
| Cron Parser | `cronstrue` + `cron-parser` |
| Random String | `nanoid` or custom |

---

## Phases

> **Workflow:** When a phase is complete — update its status to `[x]` below, then commit with message `phase N: <description>`.

| Phase | Status | Description |
|---|---|---|
| 1 | [x] | Project Scaffold & Shell |
| 2 | [x] | Core Text Tools (8 tools) |
| 3 | [x] | Converter Tools (4 tools) |
| 4 | [x] | Generator & Misc Tools (5 tools) |
| 5 | [x] | QR Code Reader/Generator |
| 6 | [x] | CI & Release Pipeline |

---

### Phase 1 — Project Scaffold & Shell
**Goal:** Runnable app with sidebar + content layout, no tools yet.

- `npm create tauri-app@latest dev-tools -- --template react-ts`
- Init Tailwind CSS
- `npx shadcn@latest init`
- Add shadcn components: `Input`, `ScrollArea`, `Separator`, `Button`, `Textarea`, `Switch`, `Badge`
- Build `App.tsx`: flex row — fixed-width `<Sidebar>` + flex-grow `<Content>`
- Build `Sidebar.tsx`: `SearchBox` + filtered `<ScrollArea>` of tool nav items (stubs)
- Add `ThemeProvider` + OS auto-detect + manual toggle
- Add `useLocalStorage` hook
- Register global shortcut `Cmd+Shift+D` via `tauri-plugin-global-shortcut`

**Verify:** `npm run tauri dev` → app opens, sidebar renders all tool names, search filters list, theme toggle works, hotkey focuses window.

---

### Phase 2 — Core Text Tools (8 tools)
**Goal:** Most-used, pure-string tools with no heavy deps.

Tools:
1. JSON Format / Validate
2. Base64 Encode/Decode
3. URL Encode/Decode
4. URL Parser
5. Backslash Escape/Unescape
6. JWT Debugger
7. Unix Time Converter
8. UUID Generator

Each tool: input `Textarea` → action buttons → output `Textarea` + `useLocalStorage` for input.

**Verify:** Each tool produces correct output; last input restored on app restart.

---

### Phase 3 — Converter Tools (4 tools)
**Goal:** Tools that transform between formats.

Tools:
1. YAML to JSON
2. JSON to YAML
3. JSON to CSV
4. CSV to JSON

Deps: `js-yaml`, `papaparse`

**Verify:** Round-trip conversions are lossless for standard inputs; errors surface clearly.

---

### Phase 4 — Generator & Misc Tools (5 tools)
**Goal:** Tools that produce output from parameters, not transform input.

Tools:
1. Lorem Ipsum Generator
2. Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
3. Markdown Preview
4. Cron Parser
5. Random String Generator

Deps: `lorem-ipsum`, `crypto-js`, `react-markdown` + `rehype-highlight`, `cronstrue` + `cron-parser`, `nanoid`

**Verify:** Hash values match known test vectors; cron next-run dates are correct; markdown renders code blocks with syntax highlighting.

---

### Phase 5 — QR Code Reader/Generator
**Goal:** QR tool (separated because it involves camera/file input, more complex UX).

- Generator: text input → QR image via `qrcode`, download button
- Reader: file upload or camera capture → decoded text via `html5-qrcode`

**Verify:** Generated QR scans correctly with phone; uploaded QR image decoded correctly.

---

### Phase 6 — CI & Release Pipeline
**Goal:** Automated cross-platform builds on tag push.

- `.github/workflows/build.yml`
- Matrix: `[macos-latest, windows-latest, ubuntu-latest]`
- `npm run tauri build` on each
- Upload artifacts to GitHub Release

**Verify:** Push a tag → 3 platform bundles appear on GitHub Releases page.

---

## End-to-End Verification

1. All 19 tools functional, no console errors
2. Large JSON (10k lines) formats without freeze
3. Sidebar search filters correctly for partial matches
4. OS theme change → app follows; manual toggle overrides
5. Kill + reopen → last inputs restored per tool
6. Global hotkey `Cmd+Shift+D` works from any app
7. CI green on all 3 platforms
