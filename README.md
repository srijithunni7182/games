# Tic Tac Toe

A clean, minimal Tic Tac Toe game with an AI opponent and local multiplayer. No ads, no accounts, no server. Runs entirely in the browser.

## What it is

Two play modes:

- **vs Computer** - single-player against a Minimax AI with three difficulty levels (Easy / Medium / Hard)
- **vs Player** - local hotseat multiplayer for two people sharing a device

The AI at Hard difficulty is unbeatable. Medium plays optimally roughly 50% of the time and randomly otherwise, which produces a human-like opponent. Easy always picks a random move.

## Tech stack

| Tool | Version | Role |
|------|---------|------|
| TypeScript | 5.x | Language |
| Vite | 6.x | Dev server and bundler |
| Vitest | 3.x | Test runner |
| ESLint + typescript-eslint | 9.x / 8.x | Linting |
| Prettier | 3.x | Formatting |

Zero runtime dependencies. The production build is plain HTML, CSS, and JS. Expected gzipped bundle size: under 15 KB.

## Prerequisites

- Node.js 18 LTS or later
- npm (bundled with Node)

## Installation

```bash
git clone https://github.com/<your-username>/tic-tac-toe.git
cd tic-tac-toe
npm install
```

## Running the project

### Development server

```bash
npm run dev
```

Opens at `http://localhost:3000` with hot module replacement.

### Production build

```bash
npm run build
```

Output goes to `dist/`. The build runs `tsc --noEmit` first, so a type error will abort the build.

### Preview the production build locally

```bash
npm run preview
```

Serves the `dist/` directory at `http://localhost:4173`.

## Testing

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests live in `tests/` and cover:

- `game-logic.test.ts` - board operations, win/draw detection, all 8 winning lines
- `ai-engine.test.ts` - Minimax correctness, blocking moves, difficulty dispatch
- `state.test.ts` - reducer transitions, store pub/sub
- `integration.test.ts` - full game flows (X wins, draw, Hard AI never loses)

## Other scripts

```bash
npm run lint          # ESLint across src/ and tests/
npm run format        # Prettier write across src/ and tests/
npm run check         # tsc + vitest (used in CI)
```

## AI difficulty levels

| Level | Behaviour |
|-------|-----------|
| Easy | Picks a random valid cell every move. Can still win by chance. |
| Medium | 50% chance per move of using Minimax, 50% random. Feels inconsistent, like a human. |
| Hard | Full Minimax with depth penalty on every move. Never loses against optimal play. |

The Minimax implementation uses a depth penalty (`+10 - depth` for AI win, `-10 + depth` for human win) so the AI prefers faster wins and will delay losses rather than resign immediately. The entire game tree evaluates in under 1 ms; the 300-600 ms delay before each AI move is intentional and purely for feel.

## Project structure

```
tic-tac-toe/
├── src/
│   ├── main.ts               # Entry point: store wiring, AI scheduling, initial render
│   ├── types.ts              # All TypeScript types and interfaces
│   ├── constants.ts          # WIN_LINES, INITIAL_STATE, AI delay config
│   ├── game-logic.ts         # Pure functions: board operations, win/draw detection
│   ├── ai-engine.ts          # Pure functions: minimax, getBestMove, getAIMove
│   ├── state.ts              # Pub/sub store, pure reducer, all action handlers
│   ├── strings.ts            # All user-facing text (externalized for future i18n)
│   ├── renderer/
│   │   ├── index.ts          # renderApp() - top-level render dispatcher
│   │   ├── menu.ts           # Mode selection screen
│   │   ├── setup.ts          # Difficulty and symbol selection screen (AI mode)
│   │   ├── game.ts           # Game board, status, score, controls
│   │   └── dom-helpers.ts    # createElement, clearChildren, $ wrappers
│   ├── styles/
│   │   └── main.css          # Custom properties, layout, board, animations, responsive
│   └── test-utils/           # Shared board factories and win-combination helpers
├── tests/
│   ├── game-logic.test.ts
│   ├── ai-engine.test.ts
│   ├── state.test.ts
│   └── integration.test.ts
├── docs/
│   ├── PRD.md                # Product requirements document
│   ├── architecture-spec.md  # Full architecture specification
│   └── ARCHITECTURE.md       # Module structure quick-reference (this repo's wiki)
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Configuration

There are no environment variables required. The only deployment-time configuration is the Vite `base` path, which must match the subdirectory if you deploy to GitHub Pages:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/tic-tac-toe/',   // set to '/' for a root deployment
  ...
});
```

AI timing and difficulty tuning is done via named constants in `src/constants.ts`:

```typescript
export const AI_DELAY_MIN = 300;              // ms, minimum AI "thinking" delay
export const AI_DELAY_MAX = 600;              // ms, maximum AI "thinking" delay
export const MEDIUM_MINIMAX_PROBABILITY = 0.5; // fraction of Medium moves that use Minimax
```

## Deployment

The `dist/` directory produced by `npm run build` is a self-contained static site. Deploy to any static host:

- **GitHub Pages** - push `dist/` via `gh-pages` branch or GitHub Actions (see `docs/architecture-spec.md` section 15.2 for the full workflow YAML)
- **Netlify / Vercel / Cloudflare Pages** - point at the repository; set build command to `npm run build` and publish directory to `dist`

## Contributing

1. Fork the repository and create a branch from `main`.
2. Run `npm run check` before opening a pull request (type-checks + lints + tests).
3. Keep new logic in pure functions where possible. The renderer is the only layer that should touch the DOM.
4. Add or update tests for any change to `game-logic.ts`, `ai-engine.ts`, or `state.ts`.

## License

MIT. See `LICENSE`.
