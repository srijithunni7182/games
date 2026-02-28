# System Architecture Specification
## Tic Tac Toe -- Web-Based Game with AI and Local Multiplayer

**Version**: 1.0
**Date**: 2026-02-28
**Status**: Draft
**Author**: Solutions Architect

---

## 1. Overview

### 1.1 Executive Summary

This document specifies the architecture, technology stack, module design, data model, and implementation plan for a client-side Tic Tac Toe web application. The game supports single-player (vs. AI with three difficulty levels) and local hotseat multiplayer modes. It is built as a pure client-side single-page application with zero server dependencies, targeting a gzipped bundle size under 50KB and a Lighthouse performance score of 90+.

The architecture prioritizes simplicity, testability, and clean separation of concerns. Game logic is implemented as pure functions operating on immutable data structures, completely independent of the rendering layer. The AI uses the Minimax algorithm with optional alpha-beta pruning. The UI is rendered with vanilla TypeScript and direct DOM manipulation, styled with CSS Grid and CSS custom properties.

### 1.2 Goals

- Deliver all P0 and P1 features defined in the PRD within a single development cycle.
- Produce a codebase that is clean, well-documented, and suitable as a reference implementation.
- Achieve Lighthouse scores of 90+ across all categories on mobile.
- Keep total JS + CSS under 50KB gzipped.
- Ensure the game is playable within 2 seconds of opening the URL.

### 1.3 Non-Goals

- Online multiplayer, user accounts, persistent storage, or server-side logic.
- Support for board sizes other than 3x3.
- Sound effects, theming, or PWA/offline support (deferred to post-MVP).
- Internationalization beyond externalizing strings for future translation.

### 1.4 Key Architectural Decisions (ADRs)

| ID | Decision | Rationale | Alternatives Considered |
|----|----------|-----------|------------------------|
| ADR-01 | Vanilla TypeScript, no framework | Bundle size constraint (<50KB); game is simple enough that a framework adds overhead without proportional benefit; maximizes educational value for the developer/student persona | Preact (7KB, good but adds abstraction), Svelte (compiled, near-zero runtime but adds build complexity), Lit (web components, overkill for 3 screens) |
| ADR-02 | Vite as build tool | Fast HMR for development; tree-shaking and minification for production; first-class TypeScript support; near-zero config | esbuild (fast but less ecosystem), Rollup (lower-level, more config), Webpack (heavy, slow for this scope), no build tool (loses TypeScript and minification) |
| ADR-03 | Functional core, imperative shell | Game logic as pure functions enables unit testing without DOM; rendering layer is a thin imperative shell that reads state and updates DOM | OOP with classes (more ceremony, harder to test), MVC framework (unnecessary abstraction layer) |
| ADR-04 | CSS Grid for board layout | 3x3 grid maps directly to CSS Grid; no hacks needed; excellent browser support | Flexbox (requires nested rows), Table (semantically wrong), Canvas (overkill, loses accessibility) |
| ADR-05 | Centralized state with event-driven rendering | Single state object is the source of truth; state changes trigger a render cycle; simple and predictable | Distributed state across components (harder to reason about), Redux-like store (overengineered for this scope) |
| ADR-06 | Vitest for testing | Same config as Vite; fast; supports TypeScript natively; good DX | Jest (heavier config, slower), Mocha (more setup), no tests (unacceptable for portfolio quality) |
| ADR-07 | CSS custom properties for theming | Enables dark mode via `prefers-color-scheme` with minimal code; future theme support is trivial | CSS-in-JS (requires runtime), Sass variables (compile-time only, no runtime switching) |

---

## 2. System Context

### 2.1 Actors

| Actor | Description |
|-------|-------------|
| **Human Player** | A person interacting with the game via browser on desktop, tablet, or mobile. May be a casual player, parent/child, or developer studying the code. |
| **AI Opponent** | A purely client-side Minimax algorithm that computes moves locally. Not a separate service or actor in the traditional sense, but logically distinct from the human player. |

### 2.2 External Dependencies

**Runtime dependencies**: None. The application is fully self-contained after the initial page load.

**Build-time dependencies**:
- Node.js (>= 18 LTS) -- build toolchain runtime
- Vite (>= 6.x) -- bundler and dev server
- TypeScript (>= 5.x) -- type checking and compilation
- Vitest (>= 3.x) -- test runner

**Deployment dependencies**:
- Any static file host (GitHub Pages, Netlify, Vercel, Cloudflare Pages)
- No server, database, API, or CDN required

### 2.3 Boundaries

The entire application runs within a single browser tab. There are no network boundaries, no server communication after initial load, and no external API calls. The security boundary is the browser sandbox itself.

```
+-----------------------------------------------------------+
|                     Browser Tab                            |
|                                                            |
|  +-----------------------------------------------------+  |
|  |              Tic Tac Toe Application                 |  |
|  |                                                      |  |
|  |  +-------------+  +------------+  +---------------+  |  |
|  |  | Game Logic  |  |  AI Engine |  | UI / Renderer |  |  |
|  |  | (Pure TS)   |  | (Pure TS)  |  | (DOM + CSS)   |  |  |
|  |  +-------------+  +------------+  +---------------+  |  |
|  |         |                |               |            |  |
|  |         +-------+--------+               |            |  |
|  |                 |                        |            |  |
|  |          +------v------+                 |            |  |
|  |          | Game State  |<----------------+            |  |
|  |          | (In-Memory) |                              |  |
|  |          +-------------+                              |  |
|  +-----------------------------------------------------+  |
+-----------------------------------------------------------+
```

---

## 3. Architecture

### 3.1 Architecture Style

**Style**: Functional Core, Imperative Shell (a variant of Ports and Adapters / Hexagonal Architecture simplified for a client-side application).

**Rationale**: The game logic is inherently functional -- given a board state and a move, produce a new board state. Modeling this as pure functions that accept and return data makes the core logic trivially testable, composable, and independent of any UI framework. The "shell" is a thin rendering layer that subscribes to state changes and updates the DOM.

This is the simplest architecture that satisfies the requirements. There are only three screens (menu, settings, game), one data model (game state), and one AI algorithm. A framework, router, or state management library would add complexity without solving any real problem at this scale.

### 3.2 Module Breakdown

The application is organized into five logical modules, each with a single responsibility:

```
+------------------------------------------------------------------+
|                        Application                                |
|                                                                   |
|  +------------------+  +------------------+  +-----------------+  |
|  |   game-logic     |  |     ai-engine    |  |     state       |  |
|  |                  |  |                  |  |                 |  |
|  | - makeMove()     |  | - minimax()      |  | - GameState     |  |
|  | - checkWinner()  |  | - getBestMove()  |  | - createState() |  |
|  | - checkDraw()    |  | - getRandomMove()|  | - dispatch()    |  |
|  | - getWinLine()   |  | - getAIMove()    |  | - subscribe()   |  |
|  | - isValidMove()  |  |                  |  |                 |  |
|  +--------+---------+  +--------+---------+  +--------+--------+  |
|           |                      |                     |          |
|           +----------------------+---------------------+          |
|                                  |                                |
|                          +-------v--------+                       |
|                          |   renderer     |                       |
|                          |                |                       |
|                          | - renderMenu() |                       |
|                          | - renderGame() |                       |
|                          | - renderBoard()|                       |
|                          | - renderScore()|                       |
|                          | - bindEvents() |                       |
|                          +-------+--------+                       |
|                                  |                                |
|                          +-------v--------+                       |
|                          |     main       |                       |
|                          |                |                       |
|                          | - init()       |                       |
|                          | - bootstrap    |                       |
|                          +----------------+                       |
+------------------------------------------------------------------+
```

#### Module 1: `game-logic` (Pure Functions)

**Responsibility**: All rules of Tic Tac Toe. Given inputs, returns outputs. Zero side effects.

| Function | Signature | Description |
|----------|-----------|-------------|
| `createBoard()` | `() => Board` | Returns an empty 9-cell board |
| `makeMove(board, index, player)` | `(Board, number, Player) => Board` | Returns a new board with the move applied |
| `isValidMove(board, index)` | `(Board, number) => boolean` | Checks if a cell is empty |
| `checkWinner(board)` | `(Board) => Player \| null` | Returns the winning player or null |
| `getWinningLine(board)` | `(Board) => number[] \| null` | Returns indices of the winning 3 cells, or null |
| `checkDraw(board)` | `(Board) => boolean` | Returns true if all cells filled and no winner |
| `getAvailableMoves(board)` | `(Board) => number[]` | Returns indices of empty cells |
| `getGameStatus(board)` | `(Board) => GameStatus` | Returns `'playing' \| 'win-x' \| 'win-o' \| 'draw'` |

#### Module 2: `ai-engine` (Pure Functions)

**Responsibility**: AI move computation. Pure functions that accept board state and return a move index.

| Function | Signature | Description |
|----------|-----------|-------------|
| `minimax(board, depth, isMaximizing, aiPlayer)` | `(Board, number, boolean, Player) => number` | Recursive Minimax scoring function |
| `getBestMove(board, aiPlayer)` | `(Board, Player) => number` | Returns the optimal move index using full Minimax |
| `getRandomMove(board)` | `(Board) => number` | Returns a random valid move index |
| `getAIMove(board, difficulty, aiPlayer)` | `(Board, Difficulty, Player) => number` | Dispatches to the correct strategy based on difficulty |

#### Module 3: `state` (State Management)

**Responsibility**: Centralized state container. Holds the single source of truth. Notifies subscribers on state changes.

This module implements a minimal pub/sub store:

```typescript
type Subscriber = (state: GameState) => void;

function createStore(initialState: GameState): Store {
  let state = initialState;
  const subscribers: Set<Subscriber> = new Set();

  return {
    getState: () => state,
    dispatch: (action: Action) => {
      state = reducer(state, action);
      subscribers.forEach(fn => fn(state));
    },
    subscribe: (fn: Subscriber) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
}
```

#### Module 4: `renderer` (DOM Manipulation)

**Responsibility**: Reads game state and updates the DOM. Binds user events and dispatches actions to the store. This is the only module that touches the DOM.

| Function | Description |
|----------|-------------|
| `renderApp(state, dispatch)` | Top-level render that delegates to screen-specific renderers based on `state.screen` |
| `renderMenu(dispatch)` | Renders the mode selection screen |
| `renderSetup(state, dispatch)` | Renders difficulty and symbol selection (AI mode) |
| `renderGame(state, dispatch)` | Renders the game board, status, score, and controls |
| `renderBoard(state, dispatch)` | Renders the 3x3 grid cells with marks and click handlers |
| `renderStatus(state)` | Renders the turn indicator or game result message |
| `renderScore(state)` | Renders the X/O/Draw score counters |

#### Module 5: `main` (Entry Point)

**Responsibility**: Bootstrap the application. Creates the store, wires up the renderer, and kicks off the initial render.

### 3.3 Component Interaction Flow

#### Sequence: Human Makes a Move (AI Mode)

```
Human          Renderer           State/Store        GameLogic        AIEngine
  |                |                   |                 |                |
  |-- click cell ->|                   |                 |                |
  |                |-- dispatch        |                 |                |
  |                |   MAKE_MOVE ----->|                 |                |
  |                |                   |-- makeMove() -->|                |
  |                |                   |<-- new board ---|                |
  |                |                   |-- checkWinner() |                |
  |                |                   |<-- result ------|                |
  |                |                   |                 |                |
  |                |                   |  [if game continues]            |
  |                |                   |-- set isAITurn  |                |
  |                |                   |                 |                |
  |                |<-- notify --------|                 |                |
  |<-- re-render --|                   |                 |                |
  |  (board locked)|                   |                 |                |
  |                |                   |                 |                |
  |                |  [after 400ms delay]                |                |
  |                |-- dispatch        |                 |                |
  |                |   AI_MOVE ------->|                 |                |
  |                |                   |-- getAIMove() --|--------------->|
  |                |                   |<-- move index --|----------------|
  |                |                   |-- makeMove() -->|                |
  |                |                   |<-- new board ---|                |
  |                |                   |-- checkWinner() |                |
  |                |                   |-- unset isAITurn|                |
  |                |                   |                 |                |
  |                |<-- notify --------|                 |                |
  |<-- re-render --|                   |                 |                |
  |  (board active)|                   |                 |                |
```

#### Sequence: Start New Game

```
Human          Renderer           State/Store
  |                |                   |
  |-- click       |                   |
  |   "Play Again"|                   |
  |                |-- dispatch        |
  |                |   NEW_GAME ------>|
  |                |                   |-- reset board
  |                |                   |-- preserve scores
  |                |                   |-- preserve settings
  |                |                   |
  |                |<-- notify --------|
  |<-- re-render --|                   |
  |  (empty board) |                   |
```

### 3.4 Screen Flow

The application has three logical screens, managed by a `screen` property in the state:

```
                    +--------+
                    | 'menu' |
                    +---+----+
                        |
              +---------+---------+
              |                   |
        vs Computer          vs Player
              |                   |
         +----v----+              |
         | 'setup' |              |
         +----+----+              |
              |                   |
    select difficulty             |
    + symbol choice               |
              |                   |
              +-------+-----------+
                      |
                 +----v----+
                 | 'game'  |
                 +----+----+
                      |
                 back to menu
                      |
                 +----v----+
                 | 'menu'  |
                 +---------+
```

- **`menu`**: Mode selection (vs Computer / vs Player)
- **`setup`**: AI difficulty and symbol selection (only for AI mode)
- **`game`**: Active game board with status, score, and controls

---

## 4. Data Architecture

### 4.1 Core Data Model

All types are defined in a single `types.ts` file:

```typescript
// --- Primitives ---

type CellValue = 'X' | 'O' | null;
type Player = 'X' | 'O';
type Board = readonly CellValue[];  // Always 9 elements, indexed 0-8
type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'ai' | 'multiplayer';
type Screen = 'menu' | 'setup' | 'game';
type GameResult = 'playing' | 'win-x' | 'win-o' | 'draw';

// --- Board Layout ---
//
//  0 | 1 | 2
// -----------
//  3 | 4 | 5
// -----------
//  6 | 7 | 8

// --- Winning Combinations ---
const WIN_LINES: readonly number[][] = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
];

// --- Game State ---

interface GameState {
  // Screen navigation
  readonly screen: Screen;

  // Game settings
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
  readonly humanSymbol: Player;     // Which symbol the human chose (AI mode)

  // Board state
  readonly board: Board;
  readonly currentPlayer: Player;
  readonly result: GameResult;
  readonly winningLine: number[] | null;

  // AI state
  readonly isAITurn: boolean;       // True while waiting for AI move
  readonly aiTimerID: number | null; // setTimeout ID for cancellation

  // Score tracking
  readonly scores: {
    readonly x: number;
    readonly o: number;
    readonly draws: number;
  };

  // Multiplayer turn alternation
  readonly roundNumber: number;     // Increments each round; determines first player in multiplayer
}

// --- Actions ---

type Action =
  | { type: 'SELECT_MODE'; mode: GameMode }
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SELECT_SYMBOL'; symbol: Player }
  | { type: 'START_GAME' }
  | { type: 'MAKE_MOVE'; index: number }
  | { type: 'AI_MOVE'; index: number }
  | { type: 'SET_AI_TIMER'; timerID: number }
  | { type: 'NEW_GAME' }
  | { type: 'BACK_TO_MENU' }
  | { type: 'RESTART_GAME' };
```

### 4.2 State Transitions (Reducer)

The reducer is a pure function: `(state: GameState, action: Action) => GameState`.

| Action | State Changes | Side Effects |
|--------|---------------|--------------|
| `SELECT_MODE` | Sets `mode`, transitions screen to `'setup'` (AI) or `'game'` (multiplayer) | None |
| `SELECT_DIFFICULTY` | Sets `difficulty` | None |
| `SELECT_SYMBOL` | Sets `humanSymbol` | None |
| `START_GAME` | Resets board, sets `screen: 'game'`, sets `currentPlayer` based on settings | If AI goes first, triggers AI move via side effect in renderer |
| `MAKE_MOVE` | Updates board at index, toggles `currentPlayer`, evaluates result, sets `winningLine` if won | None (AI scheduling is a side effect in the renderer) |
| `AI_MOVE` | Same as `MAKE_MOVE` but also unsets `isAITurn` | None |
| `SET_AI_TIMER` | Stores `aiTimerID` for cancellation | None |
| `NEW_GAME` | Resets board, increments `roundNumber`, preserves scores and settings | Cancels pending AI timer if any |
| `RESTART_GAME` | Same as `NEW_GAME` but does NOT update scores | Cancels pending AI timer |
| `BACK_TO_MENU` | Resets everything to initial state, sets `screen: 'menu'` | Cancels pending AI timer |

### 4.3 Initial State

```typescript
const INITIAL_STATE: GameState = {
  screen: 'menu',
  mode: 'ai',
  difficulty: 'medium',
  humanSymbol: 'X',
  board: Array(9).fill(null),
  currentPlayer: 'X',
  result: 'playing',
  winningLine: null,
  isAITurn: false,
  aiTimerID: null,
  scores: { x: 0, o: 0, draws: 0 },
  roundNumber: 0,
};
```

### 4.4 Data Flow Diagram

```
  User Input (click/tap)
       |
       v
  Event Handler (renderer)
       |
       v
  dispatch(Action) --> Store.reducer(state, action) --> new GameState
                                                            |
                                                            v
                                                    Store notifies subscribers
                                                            |
                                                            v
                                                    renderApp(newState)
                                                            |
                                                            v
                                                    DOM updates
```

This is a unidirectional data flow. State is never mutated directly. Every change flows through the reducer.

---

## 5. AI Engine Design

### 5.1 Minimax Algorithm

The Minimax algorithm evaluates every possible game state recursively to find the optimal move. For Tic Tac Toe's 3x3 board, the game tree is small enough (at most ~255,168 possible games, terminating early at wins) that full enumeration completes in under 1ms.

#### Pseudocode

```
function minimax(board, isMaximizing, aiPlayer):
    humanPlayer = opposite(aiPlayer)

    // Terminal conditions
    if winner(board) == aiPlayer:  return +10 - depth  // Prefer faster wins
    if winner(board) == humanPlayer: return -10 + depth // Prefer slower losses
    if isDraw(board): return 0

    if isMaximizing:
        bestScore = -Infinity
        for each empty cell:
            place aiPlayer mark
            score = minimax(board, false, aiPlayer)
            remove mark
            bestScore = max(bestScore, score)
        return bestScore
    else:
        bestScore = +Infinity
        for each empty cell:
            place humanPlayer mark
            score = minimax(board, true, aiPlayer)
            remove mark
            bestScore = min(bestScore, score)
        return bestScore
```

#### Depth Penalty

The depth parameter is used to make the AI prefer faster wins and slower losses:
- **Win score**: `+10 - depth` (prefer winning in fewer moves)
- **Loss score**: `-10 + depth` (prefer losing in more moves, giving the opponent more chances to err)

This makes the Hard AI feel more natural -- it does not just play optimally but plays aggressively.

### 5.2 Difficulty Strategies

| Difficulty | Strategy | Implementation |
|------------|----------|----------------|
| **Easy** | Random valid move every time | `getRandomMove(board)`: pick uniformly at random from `getAvailableMoves(board)` |
| **Medium** | 50% optimal, 50% random (per move) | `Math.random() < 0.5 ? getBestMove(board, aiPlayer) : getRandomMove(board)` |
| **Hard** | Optimal move every time | `getBestMove(board, aiPlayer)`: full Minimax evaluation |

The Medium difficulty creates an AI that feels "human-like" -- it sometimes makes good moves and sometimes blunders. The 50/50 split is a starting point; playtesting may suggest tuning to 60/40 or 70/30.

### 5.3 AI Move Timing

The AI computation takes less than 1ms, but instant responses feel unnatural. The renderer introduces an artificial delay:

```typescript
// In the renderer, after a human move that does not end the game:
if (state.mode === 'ai' && state.result === 'playing' && state.isAITurn) {
  const delay = 300 + Math.random() * 300; // 300-600ms
  const timerID = window.setTimeout(() => {
    const move = getAIMove(state.board, state.difficulty, aiSymbol);
    store.dispatch({ type: 'AI_MOVE', index: move });
  }, delay);
  store.dispatch({ type: 'SET_AI_TIMER', timerID });
}
```

The timer ID is stored in state so it can be cancelled on restart or back-to-menu.

### 5.4 AI Module API

```typescript
// ai-engine.ts

/**
 * Returns the best move index for the given player using full Minimax.
 * Pure function -- no side effects.
 */
export function getBestMove(board: Board, aiPlayer: Player): number;

/**
 * Returns a random valid move index.
 * Uses Math.random() -- technically impure, but acceptable for game AI.
 */
export function getRandomMove(board: Board): number;

/**
 * Returns the AI's chosen move based on the difficulty level.
 * Dispatches to getBestMove or getRandomMove accordingly.
 */
export function getAIMove(board: Board, difficulty: Difficulty, aiPlayer: Player): number;
```

---

## 6. Technology Stack

### 6.1 Decision Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | TypeScript | 5.x | Type safety, better DX, self-documenting code; compiles away to zero runtime cost |
| Build Tool | Vite | 6.x | Fast HMR, native TS support, excellent tree-shaking, minimal config, outputs optimized static files |
| Test Framework | Vitest | 3.x | Same ecosystem as Vite; fast; supports TS natively; compatible API with Jest |
| CSS | Vanilla CSS with Custom Properties | N/A | No preprocessor needed; CSS custom properties enable runtime theming; CSS Grid for layout |
| Linting | ESLint + typescript-eslint | 9.x / 8.x | Catches bugs at authorship time; enforces consistent style |
| Formatting | Prettier | 3.x | Consistent code formatting; zero debates about style |
| Deployment | GitHub Pages (via `gh-pages` or GitHub Actions) | N/A | Free; simple; pairs naturally with a GitHub repository |

### 6.2 Alternatives Considered

| Decision | Alternative | Why Not Chosen |
|----------|-------------|----------------|
| TypeScript | Vanilla JavaScript | Loses type safety; harder to refactor; less self-documenting. TS compiles away, so zero runtime cost. |
| Vite | No build tool (plain HTML/JS) | Loses TypeScript, minification, tree-shaking, and HMR. The bundle would be larger and DX worse. |
| Vite | Webpack | Slower builds, more config, heavier. Webpack is overkill for this scope. |
| Vite | esbuild (direct) | Fast but less ecosystem support for dev server, HMR, and plugins. Vite uses esbuild internally anyway. |
| Vitest | Jest | Requires additional config for TS; slower; separate ecosystem from Vite. |
| Preact | Vanilla TS | Preact (3KB) would provide JSX and component model, but adds abstraction, a build dependency, and a runtime. For 3 screens, vanilla DOM manipulation is simpler and more educational. |
| Svelte | Vanilla TS | Svelte compiles to vanilla JS (near-zero runtime), but its compiler adds build complexity and the component model is overkill for this scope. |
| CSS Modules | Vanilla CSS | Scoping is not a concern with ~100 lines of CSS total. CSS Modules add build config for no benefit. |
| Tailwind CSS | Vanilla CSS | Utility-first CSS adds a build dependency and learning curve. The game has so few styles that hand-written CSS is simpler and smaller. |

### 6.3 Dependency Graph

```
Production (runtime):
  - Zero dependencies. The output is plain HTML, CSS, and JS.

Development:
  - typescript (type checking)
  - vite (build + dev server)
  - vitest (testing)
  - eslint + @typescript-eslint/* (linting)
  - prettier (formatting)
```

---

## 7. Project File Structure

```
tic-tac-toe/
|
|-- docs/
|   |-- PRD.md                      # Product requirements document
|   |-- architecture-spec.md        # This document
|
|-- public/
|   |-- favicon.svg                 # Inline SVG favicon (no external request)
|
|-- src/
|   |-- main.ts                     # Entry point: creates store, wires renderer, bootstraps app
|   |
|   |-- types.ts                    # All TypeScript types and interfaces
|   |-- constants.ts                # WIN_LINES, INITIAL_STATE, AI delay config, string literals
|   |
|   |-- game-logic.ts              # Pure functions: board operations, win/draw detection
|   |-- ai-engine.ts               # Pure functions: minimax, getBestMove, getRandomMove, getAIMove
|   |-- state.ts                   # Store creation, reducer, action types, subscribe/dispatch
|   |
|   |-- renderer/
|   |   |-- index.ts               # renderApp() -- top-level render dispatcher
|   |   |-- menu.ts                # renderMenu() -- mode selection screen
|   |   |-- setup.ts               # renderSetup() -- difficulty + symbol selection
|   |   |-- game.ts                # renderGame() -- game board, status, score, controls
|   |   |-- dom-helpers.ts         # Utility functions: createElement, clearChildren, $ (querySelector)
|   |
|   |-- styles/
|   |   |-- main.css               # CSS custom properties, base/reset styles, layout
|   |   |-- board.css              # Board grid, cell styles, hover states, marks
|   |   |-- animations.css         # Move animations, transitions, prefers-reduced-motion
|   |   |-- responsive.css         # Media queries, mobile-first breakpoints
|   |
|   |-- strings.ts                 # All user-facing text (externalized for future i18n)
|
|-- tests/
|   |-- game-logic.test.ts         # Unit tests for all game-logic functions
|   |-- ai-engine.test.ts          # Unit tests for minimax and AI move strategies
|   |-- state.test.ts              # Unit tests for reducer and store
|   |-- integration.test.ts        # Integration tests for multi-step game flows
|
|-- index.html                      # Root HTML file (Vite entry point)
|-- vite.config.ts                  # Vite configuration
|-- tsconfig.json                   # TypeScript configuration
|-- .eslintrc.cjs                   # ESLint configuration
|-- .prettierrc                     # Prettier configuration
|-- package.json                    # Project metadata and scripts
|-- .gitignore                      # Git ignore rules
|-- LICENSE                         # MIT license
|-- README.md                       # Project readme
```

### 7.1 File Responsibility Map

| File | Touches DOM? | Has Side Effects? | Testable in Isolation? |
|------|:------------:|:-----------------:|:----------------------:|
| `types.ts` | No | No | N/A (types only) |
| `constants.ts` | No | No | N/A (constants only) |
| `game-logic.ts` | No | No | Yes |
| `ai-engine.ts` | No | Minimal (Math.random) | Yes |
| `state.ts` | No | Yes (pub/sub) | Yes (unit test reducer) |
| `renderer/*.ts` | Yes | Yes (DOM writes) | Via integration tests |
| `main.ts` | Yes | Yes (bootstrap) | Via integration tests |
| `strings.ts` | No | No | N/A (strings only) |

---

## 8. Rendering Strategy

### 8.1 Approach: Surgical DOM Updates

Rather than using a virtual DOM or re-rendering the entire page on every state change, the renderer performs targeted DOM updates. This is feasible because the UI has very few dynamic elements:

- 9 board cells (mark content, CSS classes for winning/empty)
- 1 status message
- 3 score counters
- A few buttons (play again, restart, back)

The render function compares the current screen with the previous screen. If the screen changed, it does a full re-render of the app container. If only the board state changed, it updates only the affected cells.

### 8.2 Screen Rendering

Each screen has a dedicated render function that builds DOM elements imperatively:

```typescript
// renderer/index.ts
export function renderApp(container: HTMLElement, state: GameState, dispatch: Dispatch): void {
  // Full re-render only when screen changes
  const currentScreen = container.dataset.screen;
  if (currentScreen !== state.screen) {
    container.innerHTML = '';
    container.dataset.screen = state.screen;
  }

  switch (state.screen) {
    case 'menu':
      renderMenu(container, dispatch);
      break;
    case 'setup':
      renderSetup(container, state, dispatch);
      break;
    case 'game':
      renderGame(container, state, dispatch);
      break;
  }
}
```

### 8.3 Board Rendering

The board is a `<div>` with `display: grid; grid-template-columns: repeat(3, 1fr)`. Each cell is a `<button>` element (for accessibility: focusable, activatable with Enter/Space).

```html
<div class="board" role="grid" aria-label="Tic Tac Toe board">
  <button class="cell" role="gridcell" aria-label="Row 1, Column 1, empty"
          data-index="0"></button>
  <button class="cell cell--x" role="gridcell" aria-label="Row 1, Column 2, X"
          data-index="1" disabled>X</button>
  <!-- ... 9 cells total -->
</div>
```

On each render cycle for the game screen, the renderer iterates over the 9 cells and updates:
- Text content (X, O, or empty)
- CSS class (`cell--x`, `cell--o`, `cell--winning`)
- Disabled state (occupied or game over)
- ARIA label (for screen readers)

### 8.4 Accessibility Implementation

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Cells are `<button>` elements, naturally focusable via Tab. Arrow keys can be added for grid navigation. |
| Screen reader announcements | An `aria-live="polite"` region announces turn changes and game results. ARIA labels on cells describe their state. |
| Color contrast | CSS custom properties ensure 4.5:1 text contrast and 3:1 interactive element contrast. Verified against WCAG AA. |
| Reduced motion | All animations are wrapped in `@media (prefers-reduced-motion: no-preference) { ... }`. With reduced motion preferred, transitions are instant. |
| Dark mode | CSS custom properties switch palettes via `@media (prefers-color-scheme: dark) { ... }`. |
| Touch targets | Minimum 48x48px for all interactive elements (cells and buttons). Enforced via `min-width` / `min-height`. |

---

## 9. CSS Architecture

### 9.1 Custom Properties (Design Tokens)

```css
:root {
  /* Colors -- Light Mode */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #1a1a2e;
  --color-text-muted: #6b7280;
  --color-primary: #6366f1;
  --color-x: #ef4444;
  --color-o: #3b82f6;
  --color-win-bg: #fef9c3;
  --color-border: #e5e7eb;
  --color-cell-hover: #f3f4f6;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-mark: clamp(2rem, 8vw, 4rem);

  /* Board */
  --board-size: min(90vw, 400px);
  --cell-gap: 4px;
  --border-radius: 8px;

  /* Animation */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-muted: #94a3b8;
    --color-border: #334155;
    --color-cell-hover: #334155;
    --color-win-bg: #854d0e;
  }
}
```

### 9.2 Board Grid

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--cell-gap);
  width: var(--board-size);
  height: var(--board-size);
  margin: 0 auto;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-mark);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  min-width: 48px;
  min-height: 48px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; /* Prevent double-tap-to-zoom on mobile */
}

.cell:hover:not(:disabled) {
  background-color: var(--color-cell-hover);
}

.cell:disabled {
  cursor: default;
}

.cell--x { color: var(--color-x); }
.cell--o { color: var(--color-o); }
.cell--winning { background-color: var(--color-win-bg); }
```

### 9.3 Responsive Breakpoints

```css
/* Mobile-first: base styles target 320px+ */

/* Tablet (600px+) */
@media (min-width: 600px) {
  :root {
    --board-size: min(70vw, 420px);
    --font-size-mark: clamp(2.5rem, 6vw, 4rem);
  }
}

/* Desktop (900px+) */
@media (min-width: 900px) {
  :root {
    --board-size: 440px;
  }
}
```

---

## 10. Build and Development Tooling

### 10.1 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Single JS bundle, single CSS file
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 10.2 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 10.3 Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/ tests/",
    "format": "prettier --write 'src/**/*.{ts,css}' 'tests/**/*.ts'",
    "check": "tsc --noEmit && eslint src/ tests/ && vitest run"
  }
}
```

### 10.4 Entry HTML

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Play Tic Tac Toe online - vs AI or with a friend. No ads, no accounts, instant play." />
  <meta name="theme-color" content="#6366f1" />
  <title>Tic Tac Toe</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body>
  <div id="app" role="main" aria-label="Tic Tac Toe game"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## 11. Testing Strategy

### 11.1 Test Pyramid

```
            /  E2E (optional)  \          <- Manual or Playwright, post-MVP
           /   Integration      \         <- Multi-module flows via Vitest
          /    Unit Tests         \       <- Pure function tests via Vitest
         /________________________\
```

### 11.2 Unit Tests (`game-logic.test.ts`)

| Test Case | Description |
|-----------|-------------|
| `createBoard` returns 9 nulls | Verify initial board state |
| `makeMove` places mark correctly | Place X at index 4, verify board[4] === 'X' |
| `makeMove` does not mutate original board | Ensure immutability |
| `isValidMove` returns false for occupied cell | Place X at 0, check isValidMove(board, 0) === false |
| `checkWinner` detects horizontal win | X at [0,1,2] |
| `checkWinner` detects vertical win | O at [0,3,6] |
| `checkWinner` detects diagonal win | X at [0,4,8] |
| `checkWinner` returns null for in-progress game | Partially filled board |
| `checkDraw` returns true for full board with no winner | All 9 cells filled, no 3-in-a-row |
| `checkDraw` returns false when winner exists on full board | Win on 9th move |
| `getAvailableMoves` returns correct indices | Board with some cells filled |
| `getWinningLine` returns correct indices | X wins via [2,4,6], returns [2,4,6] |

### 11.3 Unit Tests (`ai-engine.test.ts`)

| Test Case | Description |
|-----------|-------------|
| `getBestMove` blocks opponent's winning move | O has two in a row, AI must block |
| `getBestMove` takes winning move when available | AI has two in a row, must complete |
| `getBestMove` never loses as X (full game simulation) | Simulate all possible human moves; AI should never lose |
| `getBestMove` never loses as O (full game simulation) | Same, but AI plays second |
| `getRandomMove` returns a valid index | Returned index is in `getAvailableMoves` |
| `getAIMove` with 'easy' calls random | Mock/spy to verify random path taken |
| `getAIMove` with 'hard' calls minimax | Mock/spy to verify optimal path taken |

### 11.4 Unit Tests (`state.test.ts`)

| Test Case | Description |
|-----------|-------------|
| Reducer handles `SELECT_MODE` | Verify mode and screen transition |
| Reducer handles `MAKE_MOVE` | Verify board update, player toggle, result check |
| Reducer handles `NEW_GAME` | Verify board reset, score preservation |
| Reducer handles `BACK_TO_MENU` | Verify full state reset |
| Reducer handles `RESTART_GAME` | Verify board reset without score change |
| Store notifies subscribers on dispatch | Verify callback is called with new state |

### 11.5 Integration Tests (`integration.test.ts`)

| Test Case | Description |
|-----------|-------------|
| Full game: X wins in 5 moves | Dispatch a sequence of moves leading to X winning; verify final state |
| Full game: Draw in 9 moves | Dispatch all 9 moves producing a draw; verify result and scores |
| AI mode: Hard AI never loses (100 simulated games) | Randomize human moves; Hard AI must draw or win every game |
| Mode switch preserves nothing | Start game, score some wins, back to menu, start new game; verify scores reset |

---

## 12. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Gzipped JS bundle | < 30KB | `vite build` + `gzip -9` |
| Gzipped CSS bundle | < 5KB | `vite build` + `gzip -9` |
| Total gzipped (JS + CSS + HTML) | < 50KB | Sum of all assets |
| Lighthouse Performance (mobile) | 90+ | Chrome DevTools Lighthouse |
| Lighthouse Accessibility | 90+ | Chrome DevTools Lighthouse |
| Lighthouse Best Practices | 90+ | Chrome DevTools Lighthouse |
| LCP | < 1.5s on 4G | WebPageTest or Lighthouse |
| INP | < 100ms | Chrome DevTools |
| Minimax computation | < 10ms | `performance.now()` instrumentation |
| AI move total delay | 300-600ms | Artificial delay only (computation is <1ms) |

**Expected actual bundle size**: The application has approximately 500-800 lines of TypeScript. Minified and gzipped, this should be well under 10KB for JS. CSS should be under 3KB. The total bundle will likely be 8-15KB gzipped -- far under the 50KB budget.

---

## 13. Security

### 13.1 Threat Model

The attack surface is minimal because the application has no backend, no user input beyond cell clicks, no data persistence, and no network communication after initial load.

| Threat | Likelihood | Mitigation |
|--------|------------|------------|
| XSS via injected content | Very Low | No user-generated text input. All DOM content is created programmatically (no `innerHTML` with user data). |
| Dependency supply chain attack | Low | Zero runtime dependencies. Dev dependencies are widely used, pinned, and audited. |
| Clickjacking (if embedded) | Low | Set `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'self'` via hosting config. |

### 13.2 Content Security Policy

The deployment should include the following CSP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';
```

This prevents loading any external resources, which is correct since the application is fully self-contained.

---

## 14. Observability

For a client-side game with no backend, observability is limited to development-time tooling:

| Concern | Approach |
|---------|----------|
| Performance monitoring | Lighthouse CI in the deployment pipeline; manual Lighthouse audits during development |
| Error tracking | `window.onerror` and `window.onunhandledrejection` handlers that log to console (MVP). Post-MVP: integrate a lightweight error tracker like Sentry (free tier). |
| Analytics | None for MVP (privacy-first). Post-MVP: Plausible or Umami for privacy-respecting, cookie-free analytics. |
| Bundle size monitoring | `vite build` output; add a CI step to fail if gzipped bundle exceeds 50KB |

---

## 15. Deployment

### 15.1 Environment Strategy

| Environment | Purpose | URL |
|-------------|---------|-----|
| Local dev | Development with HMR | `http://localhost:3000` via `npm run dev` |
| Preview | Production build preview | `http://localhost:4173` via `npm run preview` |
| Production | Live site | GitHub Pages at `https://<username>.github.io/tic-tac-toe/` |

### 15.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Check bundle size
        run: |
          TOTAL=$(find dist -name '*.js' -o -name '*.css' | xargs gzip -c | wc -c)
          echo "Total gzipped size: $TOTAL bytes"
          if [ "$TOTAL" -gt 51200 ]; then
            echo "ERROR: Bundle exceeds 50KB gzipped"
            exit 1
          fi

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

---

## 16. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Scope creep into online multiplayer or larger boards | High | High | Strict MVP scope enforcement. The `GameMode` and board types are extensible but not implemented beyond 3x3 and local play. |
| R2 | Over-engineering (adding a framework, state library, or router) | Medium | Medium | This spec explicitly prescribes vanilla TS with a 50-line custom store. No framework. |
| R3 | AI difficulty balance feels off (Medium too easy or too hard) | Low | Low | The 50/50 split is a tunable constant. Playtest and adjust. Could expose as a slider post-MVP. |
| R4 | Mobile Safari double-tap-to-zoom interferes with gameplay | Medium | Medium | `touch-action: manipulation` on all interactive elements. Tested early on real iOS devices. |
| R5 | Accessibility gaps (keyboard nav, screen reader) | Medium | Medium | Cells are `<button>` elements (natively focusable). `aria-live` region for announcements. Test with VoiceOver and NVDA. |
| R6 | Browser compatibility edge cases | Low | Low | Target ES2020 (supported by all evergreen browsers since 2020). No bleeding-edge APIs. |

---

## 17. Implementation Roadmap

### Phase 0: Foundation (Day 1)

**Deliverables**:
- Initialize project: `npm create vite@latest`, configure TypeScript, ESLint, Prettier, Vitest
- Create file structure (all empty files with exports)
- Set up `index.html` with `<div id="app">`
- Set up CSS custom properties and base styles
- Verify `npm run dev`, `npm run build`, `npm run test` all work

**Exit Criteria**: `npm run dev` serves a page that says "Tic Tac Toe" with correct fonts and colors.

### Phase 1: Core Game Logic (Day 1-2)

**Deliverables**:
- Implement `types.ts` and `constants.ts`
- Implement `game-logic.ts` (all pure functions)
- Implement `ai-engine.ts` (Minimax, difficulty strategies)
- Write unit tests for game-logic and ai-engine (target: 100% branch coverage)

**Exit Criteria**: `npm run test` passes with all game-logic and AI tests green. Hard AI never loses in automated simulations.

### Phase 2: State Management (Day 2)

**Deliverables**:
- Implement `state.ts` (store, reducer, all actions)
- Write unit tests for the reducer

**Exit Criteria**: All state transitions tested. A sequence of dispatched actions produces the correct final state.

### Phase 3: Rendering and UI (Day 2-3)

**Deliverables**:
- Implement all renderer functions (menu, setup, game screens)
- Implement board rendering with CSS Grid
- Wire up event handlers to dispatch actions
- Implement AI move scheduling with cancellable setTimeout
- Implement responsive layout and dark mode

**Exit Criteria**: The game is fully playable in the browser in both modes. All P0 features work.

### Phase 4: Polish and P1 Features (Day 3-4)

**Deliverables**:
- Winning line highlight (F6)
- Score tracker display (F9)
- Back to menu navigation (F11)
- Player symbol choice (F14)
- Move animations with `prefers-reduced-motion` (F13)
- Multiplayer first-move alternation between rounds
- ARIA labels and screen reader announcements
- `strings.ts` externalization

**Exit Criteria**: All P0 and P1 features complete. P2 animations in place.

### Phase 5: Hardening and Deployment (Day 4-5)

**Deliverables**:
- Integration tests for full game flows
- Lighthouse audit and fix any issues (target: 90+ all categories)
- Bundle size verification (must be under 50KB gzipped)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile testing (iOS Safari, Android Chrome) -- real devices or BrowserStack
- Set up GitHub Actions CI/CD pipeline
- Deploy to GitHub Pages
- Write README.md

**Exit Criteria**: CI pipeline green. Lighthouse 90+ on mobile. Deployed and accessible at a public URL.

### Phase 6: Post-MVP Enhancements (Future)

- PWA with service worker for offline play
- localStorage score persistence
- Theme/skin system
- Sound effects (optional, with mute toggle)
- 4x4 and 5x5 board variants
- Online multiplayer via WebSocket or WebRTC

---

## 18. Open Questions and Assumptions

### Assumptions Made

| # | Assumption | Fallback |
|---|-----------|----------|
| A1 | In-memory scores only (no localStorage) | Easy to add later; `state.ts` would dispatch a side effect to write scores |
| A2 | "Player X" / "Player O" labels in multiplayer (no custom names) | Add text input to setup screen post-MVP |
| A3 | First-move alternation in multiplayer (odd rounds: X first, even rounds: O first) | Configurable via a constant |
| A4 | Medium AI uses 50/50 random/optimal split | Tunable constant; may change to 60/40 after playtesting |
| A5 | No browser history management (back button reloads the page) | Add `history.pushState` post-MVP for in-app back navigation |

### Open Questions

1. **Should the AI have a visible "thinking" indicator (e.g., a pulsing dot)?** Recommendation: Yes, a subtle CSS animation on the status text during the AI delay. Low effort, good UX.

2. **Should the game track a "streak" (consecutive wins)?** Recommendation: Defer to post-MVP. The score tracker is sufficient.

3. **Should the Vite base path be configurable for subdirectory deployment?** Recommendation: Yes. Set `base: '/tic-tac-toe/'` in `vite.config.ts` for GitHub Pages. Make it an environment variable for flexibility.

---

## Appendix A: Minimax Implementation Reference

```typescript
// ai-engine.ts -- Reference implementation

import { Board, Player } from './types';
import { checkWinner, checkDraw, getAvailableMoves } from './game-logic';

function opponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Minimax with depth penalty.
 * Returns a score: positive favors aiPlayer, negative favors opponent.
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
): number {
  const winner = checkWinner(board);

  if (winner === aiPlayer) return 10 - depth;
  if (winner === opponent(aiPlayer)) return -10 + depth;
  if (checkDraw(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const score = minimax(newBoard, depth + 1, false, aiPlayer);
      best = Math.max(best, score);
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      newBoard[move] = opponent(aiPlayer);
      const score = minimax(newBoard, depth + 1, true, aiPlayer);
      best = Math.min(best, score);
    }
    return best;
  }
}

/**
 * Returns the index of the best move for aiPlayer.
 */
export function getBestMove(board: Board, aiPlayer: Player): number {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (const move of getAvailableMoves(board)) {
    const newBoard = [...board];
    newBoard[move] = aiPlayer;
    const score = minimax(newBoard, 0, false, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Returns a random valid move index.
 */
export function getRandomMove(board: Board): number {
  const moves = getAvailableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Returns the AI's move based on difficulty.
 */
export function getAIMove(
  board: Board,
  difficulty: 'easy' | 'medium' | 'hard',
  aiPlayer: Player,
): number {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board);
    case 'medium':
      return Math.random() < 0.5
        ? getBestMove(board, aiPlayer)
        : getRandomMove(board);
    case 'hard':
      return getBestMove(board, aiPlayer);
  }
}
```

---

## Appendix B: String Constants Reference

```typescript
// strings.ts -- All user-facing text, externalized for future i18n

export const STRINGS = {
  // App
  APP_TITLE: 'Tic Tac Toe',

  // Menu
  MENU_VS_COMPUTER: 'vs Computer',
  MENU_VS_PLAYER: 'vs Player',

  // Setup
  SETUP_CHOOSE_DIFFICULTY: 'Choose Difficulty',
  DIFFICULTY_EASY: 'Easy',
  DIFFICULTY_EASY_DESC: 'Makes mistakes',
  DIFFICULTY_MEDIUM: 'Medium',
  DIFFICULTY_MEDIUM_DESC: 'Decent challenge',
  DIFFICULTY_HARD: 'Hard',
  DIFFICULTY_HARD_DESC: 'Unbeatable',
  SETUP_CHOOSE_SYMBOL: 'Play as',
  SETUP_START: 'Start Game',

  // Game
  TURN_INDICATOR: (player: string) => `${player}'s Turn`,
  RESULT_WIN: (player: string) => `${player} Wins!`,
  RESULT_DRAW: "It's a Draw!",
  BTN_PLAY_AGAIN: 'Play Again',
  BTN_RESTART: 'Restart',
  BTN_MENU: 'Menu',

  // Score
  SCORE_LABEL: 'Score',

  // Accessibility
  A11Y_BOARD: 'Tic Tac Toe board',
  A11Y_CELL: (row: number, col: number, value: string) =>
    `Row ${row}, Column ${col}, ${value || 'empty'}`,
  A11Y_GAME_RESULT: (result: string) => `Game over. ${result}`,
} as const;
```
