# Architecture

## Overview

The application uses the **Functional Core, Imperative Shell** pattern. Game logic and AI are pure functions with no side effects. The renderer is a thin imperative layer that reads state and writes to the DOM. Communication between them flows through a centralized pub/sub store.

```
src/
├── game-logic.ts     ─┐
├── ai-engine.ts       ├─ Functional core (pure, no DOM, unit-testable)
├── state.ts          ─┘
└── renderer/         ─── Imperative shell (DOM reads/writes)
    main.ts           ─── Entry point (wires core to shell, owns AI scheduling)
```

---

## Module responsibilities

### `game-logic.ts` - Board rules

Pure functions only. Input: board state. Output: new board state or derived value.

| Function | Returns |
|----------|---------|
| `createBoard()` | Empty 9-element frozen array |
| `makeMove(board, index, player)` | New board with mark placed (never mutates) |
| `isValidMove(board, index)` | `boolean` |
| `checkWinner(board)` | `'X' \| 'O' \| null` |
| `getWinningLine(board)` | `[number, number, number] \| null` |
| `checkDraw(board)` | `boolean` |
| `getAvailableMoves(board)` | `number[]` of empty cell indices |
| `getNextPlayer(player)` | Toggles `'X'` / `'O'` |

The board is a 9-element readonly array indexed 0-8 (row-major order):

```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

### `ai-engine.ts` - Minimax AI

Pure functions. No DOM access. Depends only on `game-logic` functions.

```
getAIMove(board, difficulty, aiPlayer)
    ├── 'easy'   → getRandomMove(board)
    ├── 'medium' → 50% getBestMove / 50% getRandomMove (per move)
    └── 'hard'   → getBestMove(board, aiPlayer)

getBestMove(board, aiPlayer)
    └── minimax(board, depth, isMaximizing, aiPlayer)
            Terminal: +10-depth (AI wins), -10+depth (human wins), 0 (draw)
```

The depth penalty (`+10 - depth` / `-10 + depth`) makes the AI prefer faster wins and delay losses. Full tree evaluation for 3x3 completes in under 1 ms; no alpha-beta pruning is needed.

`getRandomMove` uses `Math.random()`, making it technically impure, but this is intentional and acceptable for game AI.

### `state.ts` - Pub/sub store and reducer

The store is ~25 lines wrapping a pure reducer:

```typescript
createStore(initialState?) → { getState, dispatch, subscribe }
```

`dispatch(action)` calls `reducer(state, action)` to produce a new state object (never mutated in place), then synchronously notifies all subscribers with the new state.

The reducer handles these actions:

| Action | Effect |
|--------|--------|
| `SELECT_MODE` | Sets mode; routes to `'setup'` (AI) or `'game'` (multiplayer) |
| `SELECT_DIFFICULTY` | Updates difficulty setting |
| `SELECT_SYMBOL` | Sets human's symbol (AI mode) |
| `START_GAME` | Resets board, sets screen to `'game'`, sets `isAITurn` if AI goes first |
| `MAKE_MOVE` | Places mark, detects win/draw, updates scores, sets `isAITurn` |
| `AI_MOVE` | Same as `MAKE_MOVE` but also clears `isAITurn` |
| `NEW_GAME` | Resets board, increments `roundNumber`, preserves scores |
| `RESTART_GAME` | Resets board, does NOT change scores or `roundNumber` |
| `BACK_TO_MENU` | Returns to `INITIAL_STATE` (full reset including scores) |

### `renderer/` - DOM layer

The only code that reads from or writes to the DOM. Receives `state` and `dispatch` as arguments; has no internal state of its own.

```
renderApp(state, dispatch)
    ├── screen === 'menu'  → renderMenu(dispatch)
    ├── screen === 'setup' → renderSetup(state, dispatch)
    └── screen === 'game'  → renderGame(state, dispatch)
                                ├── renderBoard(state, dispatch)
                                ├── renderStatus(state)
                                └── renderScore(state)
```

Full re-render only happens on screen transition (`container.dataset.screen` check). Within the game screen, only the affected board cells, status text, and score counters are updated.

Cells are `<button>` elements (natively keyboard-focusable). The board uses `display: grid; grid-template-columns: repeat(3, 1fr)`. An `aria-live="polite"` region announces turn changes and game outcomes to screen readers.

---

## Unidirectional data flow

```
User input (click)
    │
    ▼
Event handler (renderer)
    │  dispatch(action)
    ▼
Store → reducer(state, action) → new GameState
    │
    │  notify subscribers
    ▼
renderer.render(newState) → DOM update
    │
    │  (if isAITurn && result === 'playing')
    ▼
scheduleAIMove() [in main.ts]
    │  setTimeout 300-600ms
    ▼
store.dispatch({ type: 'AI_MOVE', index })
```

State is never written directly. Every change goes through `dispatch`.

---

## AI scheduling in `main.ts`

The AI timer lives in `main.ts` rather than in the reducer or renderer. This is a deliberate boundary decision: the reducer must be a pure function (no `setTimeout`), and the renderer should not own side-effect lifecycle.

```typescript
// main.ts (simplified)

let aiTimer: ReturnType<typeof setTimeout> | null = null;

store.subscribe((state) => {
  renderer.render(state);

  if (state.isAITurn && state.result === 'playing') {
    scheduleAIMove();   // idempotent: does nothing if timer already running
  } else {
    cancelAIMove();     // cancels pending timer on restart, back-to-menu, or game over
  }
});
```

`scheduleAIMove` reads the current state at fire time (not closure-captured state at schedule time) so a stale closure cannot cause a move to be played after the game has been reset:

```typescript
function scheduleAIMove(): void {
  if (aiTimer !== null) return;
  const delay = AI_DELAY_MIN + Math.random() * (AI_DELAY_MAX - AI_DELAY_MIN);
  aiTimer = setTimeout(() => {
    aiTimer = null;
    const s = store.getState();                         // fresh state at fire time
    if (s.isAITurn && s.result === 'playing') {
      const aiPlayer = s.humanSymbol === 'X' ? 'O' : 'X';
      const move = getAIMove(s.board, s.difficulty, aiPlayer);
      store.dispatch({ type: 'AI_MOVE', index: move });
    }
  }, delay);
}
```

`cancelAIMove` calls `clearTimeout` whenever the game ends, is restarted, or navigates back to the menu.

---

## Data model summary

```typescript
type CellValue = 'X' | 'O' | null;
type Board     = readonly CellValue[];  // 9 elements, indices 0-8

interface GameState {
  screen:       'menu' | 'setup' | 'game';
  mode:         'ai' | 'multiplayer';
  difficulty:   'easy' | 'medium' | 'hard';
  humanSymbol:  'X' | 'O';
  board:        Board;
  currentPlayer:'X' | 'O';
  result:       'playing' | 'win-x' | 'win-o' | 'draw';
  winningLine:  [number, number, number] | null;
  isAITurn:     boolean;
  aiTimerID:    number | null;          // unused in current impl; timer lives in main.ts
  scores:       { x: number; o: number; draws: number };
  roundNumber:  number;                 // used to alternate first player in multiplayer
}
```

All types are defined in `src/types.ts`. All actions are discriminated unions on `action.type`.

---

## Testing approach

| Layer | Test file | Strategy |
|-------|-----------|----------|
| `game-logic.ts` | `tests/game-logic.test.ts` | Unit - pure functions, no DOM |
| `ai-engine.ts` | `tests/ai-engine.test.ts` | Unit - includes full game simulation (Hard AI never loses) |
| `state.ts` | `tests/state.test.ts` | Unit - reducer and store pub/sub |
| Full flows | `tests/integration.test.ts` | Dispatch sequences; verify final state |

The renderer is not unit-tested directly. It is covered by integration tests and manual Lighthouse audits.

Run all tests with `npm test`. See the README for watch mode and coverage commands.
