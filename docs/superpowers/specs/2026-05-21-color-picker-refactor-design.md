# ColorPickerTool Refactor Design

**Date:** 2026-05-21  
**Scope:** Decompose `src/components/tools/ColorPickerTool.tsx` (358 lines) into a co-located feature folder with extracted hooks and sub-components.

## Goals

1. Split into smaller, single-purpose files
2. Simplify internal logic — eliminate duplicated pointer handler pairs

## File Structure

```
src/components/tools/ColorPickerTool/
├── index.tsx              # ~50 lines — thin orchestrator
├── FormatRow.tsx          # editable format input + copy button
├── ColorWheel.tsx         # canvas wheel + crosshair cursor
├── ColorSlider.tsx        # reusable slider (brightness or opacity)
├── SavedColors.tsx        # 16-slot grid + eyedropper button
├── useColorWheel.ts       # canvas draw effect + wheel pointer handlers
└── useDragSlider.ts       # generic drag→value hook
```

The existing `src/lib/tool-logic/color.ts` is unchanged.

## Hooks

### `useDragSlider(ref, onValue)`

Generic hook that replaces three near-identical pointer handler pairs (wheel brightness, opacity).

- **Input:** `ref: RefObject<HTMLElement>`, `onValue: (pct: number) => void`
- **Output:** `{ onPointerDown, onPointerMove }` (React pointer event handlers)
- **Logic:** On pointer down → capture pointer, compute `(clientX - rect.left) / rect.width` clamped to [0, 1], call `onValue(pct * 100)`. On pointer move → same if buttons pressed.

### `useColorWheel(ref, hsv, setHsv)`

Owns canvas draw effect + wheel-specific polar coordinate math.

- **Input:** `ref: RefObject<HTMLDivElement>`, `hsv: Hsv`, `setHsv: (hsv: Hsv) => void`
- **Output:** `{ onPointerDown, onPointerMove, onDoubleClick, cursorLeft, cursorTop }`
- **Canvas draw:** Fires on `hsv.v` change. `hsvToRgbFast` stays here (canvas perf optimization, not a general util).
- **Wheel pick:** Converts `(clientX, clientY)` → polar `(angle, dist)` → `{ h, s }` update.
- **Double-click:** Saves current color to first empty slot (calls `setSavedColors` passed via hsv context — actually, double-click saving needs `savedColors` + `setSavedColors`. Move double-click handler back to `index.tsx` or pass them into the hook). Decision: pass `savedColors` + `setSavedColors` into `useColorWheel` so the hook stays self-contained.

## Components

### `ColorWheel`

Pure display component.

- **Props:** `hsv: Hsv`, `canvasRef`, pointer handlers, `cursorLeft: string`, `cursorTop: string`, `onDoubleClick`
- **Renders:** `<canvas>` + crosshair `<div>`

### `ColorSlider`

Reusable gradient slider with thumb.

- **Props:** `value: number` (0–100), `gradient: string` (CSS gradient), `thumbColor: string`, `sliderRef`, `onPointerDown`, `onPointerMove`
- Used twice: brightness (gradient `#000 → pureHueHex`, thumb = `hexColor`) and opacity (checkerboard + color gradient, thumb = `hexColor`)

### `SavedColors`

Owns `animatingSlot` state and `hasEyeDropper` detection. Receives `hsv`, `savedColors`, `setSavedColors` as props.

- Renders eyedropper button (if supported) + 16-slot grid
- Handles slot click, right-click clear, eyedropper internally

### `FormatRow`

Unchanged logic, moved to own file. Props: `label`, `value`, `onCommit`.

## State Ownership (`index.tsx`)

| State | Owner | Reason |
|---|---|---|
| `hsv` | `index.tsx` | Shared across wheel, sliders, format rows |
| `savedColors` | `index.tsx` | Shared between wheel double-click and SavedColors |
| `animatingSlot` | `SavedColors` | Only used internally |
| `hasEyeDropper` | `SavedColors` | Only used internally |

## Data Flow

```
index.tsx
  hsv, setHsv ──→ useColorWheel ──→ ColorWheel (handlers + cursor pos)
                                  ──→ (savedColors write on double-click)
  hsv.v ──────→ useDragSlider ──→ ColorSlider (brightness)
  hsv.a ──────→ useDragSlider ──→ ColorSlider (opacity)
  hsv ────────→ FormatRow × 5 (format + parse callbacks)
  hsv, savedColors ──→ SavedColors
```

## Non-Goals

- No changes to `color.ts`
- No new shared hooks in `src/hooks/` (these are tool-specific)
- No behavior changes — pixel-perfect same UX
