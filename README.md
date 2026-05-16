# Dev Tools

A cross-platform desktop app with 18 offline-first developer utilities. Built with Tauri v2, React, and TypeScript.

![Dev Tools screenshot](public/screenshot.png#123)

## Tools

| Category | Tools |
|---|---|
| **Text** | JSON Format/Validate, Base64 Encode/Decode, URL Encode/Decode, URL Parser, Backslash Escape/Unescape, JWT Debugger |
| **Time** | Unix Time Converter |
| **Converters** | YAML ↔ JSON, JSON ↔ CSV |
| **Generators** | UUID Generator, Lorem Ipsum, Hash (MD5/SHA-1/SHA-256/SHA-512), Random String, QR Code |
| **Misc** | Markdown Preview, Cron Parser |

## Features

- Searchable sidebar — filter tools by name instantly
- Dark / Light / OS auto theme
- Last input restored per tool across restarts (localStorage)
- Global hotkey `Cmd+Shift+D` to focus from any app
- Fully offline — no network requests

## Stack

- [Tauri v2](https://tauri.app) — native shell
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Vite

## Development

```bash
bun install
bun run tauri dev
```

## Build

```bash
bun run tauri build
```

Produces platform-native installers in `src-tauri/target/release/bundle/`.

CI builds for macOS, Windows, and Linux are triggered on tag push via GitHub Actions.
