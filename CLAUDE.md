# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp Group Analytics Dashboard — a React + D3 application that parses WhatsApp chat exports (.txt, .json, .csv) and displays interactive visualizations with cross-filtering, theme toggle, and PDF export. UI is in Portuguese (PT-PT).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint (flat config, TS/React rules)
npm run preview      # Serve production build locally
```

## Architecture

### Context Providers (src/context/)

The app uses three React contexts nested in `App.tsx`:
- **ThemeProvider** → light/dark mode with localStorage persistence
- **DataSourceProvider** → manages dataset loading (sample `cr.txt` or user-imported), parsing, progress, errors, and `datasetId` for cache invalidation
- **FilterProvider** → global user selection with memoized callbacks (prevents infinite loops) and localStorage persistence

### Data Flow

1. **Import**: `DataSourceContext` accepts files via `importFile()`, detects format, stores raw data in localStorage, and calls parsers
2. **Parse**: `src/utils/importParsers.ts` routes to format-specific parsers; TXT uses `parseWhatsAppChat()` from `parser.ts`
3. **Aggregate**: `useChartData` hook applies filter context and computes summary, userStats, heatmap, wordFrequencies via memoized functions
4. **Render**: Dashboard passes aggregated data to D3-based chart components

### Key Files

| Path | Purpose |
|------|---------|
| `src/utils/parser.ts` | WhatsApp TXT parser, user stats, heatmap, word cloud calculations |
| `src/utils/importParsers.ts` | Format detection + JSON/CSV parsers |
| `src/hooks/useChartData.ts` | Central aggregation hook used by Dashboard |
| `src/types/index.ts` | Shared TypeScript interfaces (Message, UserStats, HeatmapCell, etc.) |

### Parsing Details

- `parser.ts` contains `PHONE_TO_NAME` and `USER_ALIASES` maps to normalize sender names
- System messages (group creation, additions, etc.) are detected via `SYSTEM_PATTERNS` regex array
- Mentions use WhatsApp's LRM-marked format `@⁨Name⁩`; plain `@` is not matched to avoid email false positives
- Portuguese stopwords in `src/utils/stopwords-pt.ts`

## Tailwind Configuration

Dark mode uses `class` strategy. Theme toggling adds/removes `dark` class on `<html>`.
