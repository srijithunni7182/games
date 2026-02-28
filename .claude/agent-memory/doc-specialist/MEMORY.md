# Doc Specialist Memory - tic-tac-toe

## Project identity
- Name: tic-tac-toe (package.json `name: "tic-tac-toe"`)
- Version: 1.0.0
- Stack: Vanilla TypeScript 5.x + Vite 6.x + Vitest 3.x
- No runtime dependencies; all deps are devDependencies

## Architecture pattern
- Functional Core / Imperative Shell
- Core: game-logic.ts, ai-engine.ts, state.ts (pure functions, no DOM)
- Shell: src/renderer/ (sole DOM layer), main.ts (entry + AI scheduling)
- State: minimal pub/sub store in state.ts wrapping a pure reducer

## Key conventions
- Board is a 9-element readonly array, indices 0-8 row-major
- All types live in src/types.ts; all constants in src/constants.ts
- User-facing strings externalized in src/strings.ts (future i18n)
- CSS: single main.css with custom properties (no preprocessor, no Tailwind)

## AI scheduling boundary
- setTimeout lives in main.ts, NOT in the reducer (pure) or renderer
- Timer reads store.getState() at fire time to avoid stale-closure bugs
- cancelAIMove() called on NEW_GAME, RESTART_GAME, BACK_TO_MENU

## Scripts
- dev: vite (port 3000)
- build: tsc --noEmit && vite build → dist/
- test: vitest run
- test:watch: vitest
- test:coverage: vitest run --coverage
- lint: eslint src/ tests/
- check: tsc --noEmit && vitest run (used in CI)

## Test files
- tests/game-logic.test.ts, tests/ai-engine.test.ts
- tests/state.test.ts, tests/integration.test.ts
- Renderer NOT unit-tested; covered by integration tests

## Difficulty constants (tunable in constants.ts)
- AI_DELAY_MIN=300, AI_DELAY_MAX=600 (ms)
- MEDIUM_MINIMAX_PROBABILITY=0.5

## Docs generated
- README.md (project root) - 2026-02-28
- docs/ARCHITECTURE.md - 2026-02-28
