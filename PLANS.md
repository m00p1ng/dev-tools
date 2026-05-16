# Dev Tools Desktop App — Full Product Spec

## Context

Existing app is feature-complete. This document is the authoritative product spec: tool-by-tool behavior, UI states, error cases, keyboard shortcuts, data formats, and non-functional requirements. Stack stays the same. Reference for contributors and future iterations.

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Tauri v2 (Rust shell) |
| Frontend | React 19 + TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Compute | Pure JS/TS (no Rust backend calls) |
| Bundler | Vite 7 |
| Package manager | Bun |
| Platforms | macOS, Windows, Linux |

---

## Architecture

```
src/
  App.tsx               Root layout (sidebar + content), activeTool state
  tools.ts              Tool registry: id, label, icon, color, group
  components/
    Sidebar.tsx         Nav + search + favorites + manage panel
    ThemeToggle.tsx     Dark / light / OS-auto toggle
    ToolContent.tsx     Dynamic renderer — maps tool id → component
    tools/              One file per tool (19 total)
    ui/                 shadcn base components
  hooks/
    useLocalStorage.ts  useState wrapper, auto-syncs to localStorage
    useCopy.ts          Clipboard write + copied state
    useDropText.ts      Drag-drop text/file onto textarea
    useFontSize.ts      Global font size scaling
    useTheme.ts         Theme read/write
  lib/
    utils.ts            cn() helper
    copy.ts             Clipboard util

src-tauri/
  src/lib.rs            Global shortcut Cmd+Shift+D → show/focus window
  tauri.conf.json       Window size, bundle config, app identifier
```

**Routing:** No URL router. `activeTool: string` state in App.tsx. ToolContent.tsx maps ID → component.

**Tool isolation:** Each tool component is self-contained, manages own state via `useLocalStorage`. No props, no shared tool state.

---

## UI / UX Spec

### Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar (288px fixed) │ Content (flex-1)        │
│                        │                         │
│  [Search box]          │  <ActiveTool />          │
│  ─────────────         │                         │
│  Favorites             │                         │
│  ─────────────         │                         │
│  All Tools             │                         │
│  (grouped)             │                         │
│                        │                         │
│  [Manage] [Theme]      │                         │
└─────────────────────────────────────────────────┘
```

### Sidebar

- Fixed 288px width, collapsible on mobile (lg breakpoint)
- Search box at top: live filter (case-insensitive substring match on tool name)
- Tools grouped by category: Text, Time, Converters, Generators, Misc
- Each tool item: icon (filled variant preferred) + label + color accent
- Star icon → toggle favorite; favorites pinned above grouped list
- "Manage" panel: show/hide tools by group, reset to defaults
- Sidebar state (favorites, hidden) persisted to localStorage

### Theme

- Three modes: Dark, Light, OS auto-detect
- Toggle component in sidebar footer
- OS preference detected via `prefers-color-scheme` media query
- Manual override stored in localStorage key `theme`
- CSS variables for all colors (no hardcoded hex in components)

### Animations

- Framer Motion: page transitions between tools, sidebar toggle, star hover
- No animation for error states (must be immediately visible)

### Typography

- Global font size: adjustable via `useFontSize` hook
- Sizes: sm / md (default) / lg
- Persisted to localStorage key `font-size`

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Shift+D` | System-wide: show/focus app window |
| `Cmd+K` | Focus sidebar search |
| `Cmd+Enter` | Run primary action in active tool |
| `Cmd+Shift+C` | Copy output of active tool |

All shortcuts: macOS `Cmd`, Windows/Linux `Ctrl`.

---

## Persistence

localStorage keys:

| Key | Value | Notes |
|---|---|---|
| `theme` | `"dark"` \| `"light"` \| `"system"` | Theme preference |
| `font-size` | `"sm"` \| `"md"` \| `"lg"` | Global font scale |
| `active-tool` | tool id string | Restore on relaunch |
| `favorites` | JSON array of tool ids | Sidebar favorites |
| `hidden-tools` | JSON array of tool ids | Manage panel visibility |
| `tool:{id}` | tool-specific JSON | Last input per tool |

---

## Error Handling

- **All errors: inline only.** No toasts.
- Error shown in output area: red border + red badge with message
- Input area: no change (preserve user input on error)
- Error clears when input changes
- No async errors (all compute is synchronous JS)

---

## Non-Functional Requirements

- **Performance:** No UI freeze on normal inputs. Heavy ops debounce ≥300ms where applicable.
- **Accessibility:** WCAG 2.1 AA — keyboard navigation, visible focus rings, sufficient color contrast. Screen reader deep compliance not required.
- **Bundle size:** No hard limit. Avoid adding large deps when a smaller alternative exists.
- **Offline:** 100% offline. No network calls from any tool.
- **Security:** No `eval()`, no `innerHTML` with user content. JWT signing uses Web Crypto or trusted lib only.

---

## Tool Spec (19 Tools)

### 1. JSON Format / Validate

**File:** `src/components/tools/JsonFormatTool.tsx`  
**Lib:** `jsonrepair`, built-in `JSON.parse`  
**Persistence key:** `tool:json-format` → `{ input: string, indent: number }`

**Inputs:**
- Textarea: raw JSON string
- Indent selector: 2 / 4 / tab

**Actions:**
- Format: pretty-print with selected indent
- Minify: single line, no whitespace
- Validate: show valid/invalid badge only (no transform)
- Repair: run `jsonrepair` on malformed input, show result

**Output:** Textarea (read-only) + copy button

**Error states:**
- Invalid JSON (after Validate/Format): red badge "Invalid JSON: {message}"
- Empty input: disable action buttons

---

### 2. Base64 Encode / Decode

**File:** `src/components/tools/Base64Tool.tsx`  
**Lib:** built-in `btoa` / `atob`  
**Persistence key:** `tool:base64` → `{ input: string, mode: "encode"|"decode" }`

**Inputs:**
- Textarea: raw or encoded string
- Mode toggle: Encode / Decode

**Actions:** Auto-run on input change (debounce 300ms)

**Output:** Textarea (read-only) + copy button

**Error states:**
- Invalid Base64 on decode: red badge "Invalid Base64"
- Non-latin1 chars on encode: red badge "Input contains characters outside latin1 range"

---

### 3. URL Encode / Decode

**File:** `src/components/tools/UrlEncodeTool.tsx`  
**Lib:** built-in `encodeURIComponent` / `decodeURIComponent`  
**Persistence key:** `tool:url-encode` → `{ input: string, mode: "encode"|"decode" }`

**Inputs:**
- Textarea: raw or encoded string
- Mode toggle: Encode / Decode

**Actions:** Auto-run on input change

**Output:** Textarea (read-only) + copy button

**Error states:**
- Malformed URI sequence on decode: red badge "Malformed URI sequence"

---

### 4. URL Parser

**File:** `src/components/tools/UrlParserTool.tsx`  
**Lib:** built-in `URL` constructor  
**Persistence key:** `tool:url-parser` → `{ input: string }`

**Inputs:**
- Single-line input: URL string

**Output (parsed fields, read-only):**
- Protocol, hostname, port, pathname, search, hash
- Query params: key/value table
- Each field: individual copy button

**Error states:**
- Invalid URL: red badge "Invalid URL" on all output fields

---

### 5. Backslash Escape / Unescape

**File:** `src/components/tools/BackslashTool.tsx`  
**Lib:** custom regex  
**Persistence key:** `tool:backslash` → `{ input: string, mode: "escape"|"unescape" }`

**Inputs:**
- Textarea: string
- Mode toggle: Escape / Unescape

**Actions:** Auto-run on input change

**Escape:** replaces `\n`, `\t`, `"`, `\`, etc. with escaped forms  
**Unescape:** reverse

**Output:** Textarea (read-only) + copy button

**Error states:** None (always produces output)

---

### 6. JWT Debugger

**File:** `src/components/tools/JwtTool.tsx`  
**Lib:** `jwt-decode`  
**Persistence key:** `tool:jwt` → `{ input: string }`

**Inputs:**
- Textarea: JWT string

**Output sections:**
- Header: JSON (syntax highlighted)
- Payload: JSON (syntax highlighted)
- Signature: raw string + validity badge
- Expiry: human-readable date + expired/valid badge

**Actions:**
- Decode: auto-run on input change
- HS256 Verify: secret input field → valid/invalid badge

**Error states:**
- Malformed JWT (not 3 parts): red badge "Invalid JWT format"
- Invalid base64url segment: red badge "Decode failed: {message}"

---

### 7. Unix Time Converter

**File:** `src/components/tools/UnixTimeTool.tsx`  
**Lib:** `dayjs`  
**Persistence key:** `tool:unix-time` → `{ input: string }`

**Inputs:**
- Input field: unix timestamp (seconds or ms, auto-detected)
- "Now" button: fill current timestamp

**Output:**
- UTC datetime string
- Local datetime string
- ISO 8601 string
- Relative time ("3 hours ago")
- Each field: copy button

**Reverse conversion:** Datetime input → unix timestamp output

**Error states:**
- Non-numeric input: red badge "Invalid timestamp"
- Out-of-range timestamp: red badge "Timestamp out of range"

---

### 8. UUID Generator

**File:** `src/components/tools/UuidTool.tsx`  
**Lib:** `uuid`, `ulid`  
**Persistence key:** `tool:uuid` → `{ version: string, count: number }`

**Options:**
- Version: v1, v4, v7, ULID, ObjectId, v3 (namespace+name), v5 (namespace+name)
- Count: 1–100

**Actions:**
- Generate button + bulk copy (all results)

**Output:** List of generated IDs, each with individual copy button

**Error states:**
- v3/v5 empty name: red badge "Name required"
- v3/v5 invalid namespace UUID: red badge "Invalid namespace UUID"

---

### 9. YAML → JSON

**File:** `src/components/tools/YamlToJsonTool.tsx`  
**Lib:** `js-yaml`  
**Persistence key:** `tool:yaml-to-json` → `{ input: string }`

**Inputs:** Textarea: YAML string

**Actions:** Auto-run on input change (debounce 300ms)

**Output:** Textarea: formatted JSON (2-space indent) + copy button

**Error states:**
- Invalid YAML: red badge "YAML parse error: {message}"

---

### 10. JSON → YAML

**File:** `src/components/tools/JsonToYamlTool.tsx`  
**Lib:** `js-yaml`  
**Persistence key:** `tool:json-to-yaml` → `{ input: string }`

**Inputs:** Textarea: JSON string

**Actions:** Auto-run on input change (debounce 300ms)

**Output:** Textarea: YAML string + copy button

**Error states:**
- Invalid JSON: red badge "JSON parse error: {message}"

---

### 11. JSON → CSV

**File:** `src/components/tools/JsonToCsvTool.tsx`  
**Lib:** `papaparse`  
**Persistence key:** `tool:json-to-csv` → `{ input: string }`

**Inputs:** Textarea: JSON array of objects

**Actions:** Auto-run on input change

**Output:** Textarea: CSV string + copy button + download button (.csv)

**Error states:**
- Not a JSON array: red badge "Input must be a JSON array of objects"
- Array items not objects: red badge "Array items must be objects"

---

### 12. CSV → JSON

**File:** `src/components/tools/CsvToJsonTool.tsx`  
**Lib:** `papaparse`  
**Persistence key:** `tool:csv-to-json` → `{ input: string }`

**Inputs:** Textarea: CSV string

**Actions:** Auto-run on input change

**Output:** Textarea: JSON array (2-space indent) + copy button

**Error states:**
- Parse error: red badge "CSV parse error: {message}"

---

### 13. Lorem Ipsum Generator

**File:** `src/components/tools/LoremIpsumTool.tsx`  
**Lib:** `lorem-ipsum`  
**Persistence key:** `tool:lorem-ipsum` → `{ count: number, unit: "words"|"sentences"|"paragraphs" }`

**Options:**
- Count: 1–100
- Unit: Words / Sentences / Paragraphs

**Actions:** Generate button + Re-generate button (new random output)

**Output:** Textarea (read-only) + copy button

**Error states:** None

---

### 14. Hash Generator

**File:** `src/components/tools/HashTool.tsx`  
**Lib:** `crypto-js`  
**Persistence key:** `tool:hash` → `{ input: string }`

**Inputs:**
- Textarea: string to hash
- File input: hash a file (read as ArrayBuffer)

**Output (all shown simultaneously):**
- MD5, SHA-1, SHA-256, SHA-512 — each: hex string + copy button

**Actions:** Auto-run on input change (debounce 300ms)

**Error states:** Empty input shows empty output fields (no error badge)

---

### 15. Markdown Preview

**File:** `src/components/tools/MarkdownTool.tsx`  
**Lib:** `react-markdown` + `rehype-highlight`  
**Persistence key:** `tool:markdown` → `{ input: string }`

**Inputs:** Textarea: markdown string

**Output:** Live-rendered HTML preview (side-by-side or tab toggle). Code blocks: syntax highlighted.

**Error states:** None (react-markdown renders invalid markdown as-is)

---

### 16. Mermaid Diagram

**File:** `src/components/tools/MermaidTool.tsx`  
**Lib:** `mermaid`, `react-simple-code-editor`, `react-syntax-highlighter`  
**Persistence key:** `tool:mermaid` → `{ input: string }`

**Inputs:** Code editor with Mermaid syntax highlighting

**Output:** Live SVG preview with pan + zoom. Export: PNG, JPG, SVG.

**Actions:** Auto-render on input change (debounce 500ms)

**Error states:**
- Parse error: red badge "Diagram error: {message}", preview shows last valid diagram

---

### 17. Cron Parser

**File:** `src/components/tools/CronTool.tsx`  
**Lib:** `cronstrue`, `cron-parser`  
**Persistence key:** `tool:cron` → `{ input: string }`

**Inputs:** Single-line input: cron expression (5 or 6 fields)

**Output:**
- Human-readable description (cronstrue)
- Next 5 run times (cron-parser), each with copy button

**Actions:** Auto-run on input change

**Error states:**
- Invalid cron: red badge "Invalid cron: {message}"

---

### 18. Random String Generator

**File:** `src/components/tools/RandomStringTool.tsx`  
**Lib:** `nanoid` or custom  
**Persistence key:** `tool:random-string` → `{ length: number, charset: string[], count: number }`

**Options:**
- Length: 1–256
- Character sets (multi-select): Uppercase, Lowercase, Numbers, Symbols
- Count: 1–50

**Actions:** Generate button + Re-generate button

**Output:** List of strings, bulk copy + individual copy buttons

**Error states:**
- No charset selected: red badge "Select at least one character set"

---

### 19. QR Code

**File:** `src/components/tools/QrCodeTool.tsx`  
**Lib:** `qrcode` (generate), `jsqr` (read)  
**Persistence key:** `tool:qr-code` → `{ input: string, mode: "generate"|"read" }`

**Mode: Generate**
- Input: text / URL
- Error correction: L / M / Q / H
- Output: QR image preview + download PNG

**Mode: Read**
- Input: file upload (PNG/JPG) or drag-drop
- Output: decoded text + copy button

**Error states:**
- Read, no QR found: red badge "No QR code detected"
- Read, unsupported file: red badge "Unsupported file type. Use PNG or JPG."

---

## CI & Release Pipeline

**Trigger:** Git tag matching `v*` (e.g., `v1.2.0`)

**File:** `.github/workflows/release.yml`

**Matrix:** `macos-latest`, `windows-latest`, `ubuntu-latest`

**Steps per platform:**
1. Checkout
2. Setup Node + Bun
3. `bun install`
4. Setup Rust toolchain
5. `bun run tauri build`
6. Upload artifacts to GitHub Release

**Artifacts:**
- macOS: `.dmg`
- Windows: `.msi`
- Linux: `.AppImage` + `.deb`

No auto-update. Users download from GitHub Releases manually.

---

## Verification Checklist

### Per-tool
- [ ] Correct output for known-good inputs
- [ ] Error badge shown for invalid inputs
- [ ] Error clears on input change
- [ ] Last input restored on app restart
- [ ] Copy button copies correct value

### Global
- [ ] All 19 tools render without console errors
- [ ] Sidebar search filters correctly (partial match)
- [ ] Favorites persist across restarts
- [ ] Hidden tools persist across restarts
- [ ] Last active tool restored on relaunch
- [ ] Theme toggle: dark / light / system all work
- [ ] OS theme change → app follows (when in system mode)
- [ ] Font size toggle persists
- [ ] `Cmd+Shift+D` focuses app from any other app
- [ ] `Cmd+K` focuses sidebar search
- [ ] `Cmd+Enter` triggers primary action in active tool
- [ ] `Cmd+Shift+C` copies active tool output
- [ ] WCAG 2.1 AA: all interactive elements keyboard-navigable, focus rings visible
- [ ] No network requests (verify in DevTools network tab)
- [ ] CI: tag push → all 3 platform bundles on GitHub Releases
