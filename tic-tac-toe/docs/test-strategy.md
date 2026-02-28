# Test Strategy Document
## Tic Tac Toe -- Web-Based Game with AI and Local Multiplayer

**Version**: 1.0
**Date**: 2026-02-28
**Status**: Draft
**Derived From**: PRD v1.0 (2026-02-28)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview for Testing](#2-system-overview-for-testing)
3. [Unit Test Strategy](#3-unit-test-strategy)
4. [Component Test Strategy](#4-component-test-strategy)
5. [Integration Test Strategy](#5-integration-test-strategy)
6. [End-to-End (E2E) Test Strategy](#6-end-to-end-e2e-test-strategy)
7. [Non-Functional Testing](#7-non-functional-testing)
8. [Test Pyramid Summary](#8-test-pyramid-summary)
9. [CI/CD Integration](#9-cicd-integration)
10. [Test Data Management Strategy](#10-test-data-management-strategy)
11. [Tooling Summary Table](#11-tooling-summary-table)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Executive Summary

### Purpose

This document defines the comprehensive testing strategy for the Tic Tac Toe web application. It serves as the definitive blueprint for all testing activities, spanning unit tests for core game logic, component tests for UI state management, integration tests for module interplay, and end-to-end tests for complete user journeys. The strategy is designed to be implemented alongside the application code from day one using a test-driven or test-first approach.

### Scope

The system under test is a purely client-side single-page web application built with HTML, CSS, and Vanilla JavaScript/TypeScript (bundled via Vite). It includes:

- Core game engine (board state, turn management, win/draw detection)
- Minimax AI with three difficulty tiers (Easy, Medium, Hard)
- Two play modes: vs AI and local hotseat multiplayer
- Session-scoped score tracking
- Responsive UI with animations and accessibility support

There is no backend, no database, no network communication, and no authentication. All state lives in browser memory for the duration of a session.

### Key Risks Being Mitigated

| Risk | Severity | Testing Layer |
|------|----------|---------------|
| Minimax algorithm returns suboptimal moves at Hard difficulty | **Critical** | Unit tests (exhaustive board-state verification) |
| Win detection misses a winning combination or falsely triggers | **Critical** | Unit tests (all 8 win patterns, edge cases) |
| Board accepts input during AI turn or after game ends | **High** | Component tests, E2E tests |
| Score tracker miscounts or resets unexpectedly | **Medium** | Component tests, E2E tests |
| UI breaks on mobile viewports or specific browsers | **High** | E2E tests, visual regression, Lighthouse audits |
| Accessibility violations (keyboard nav, screen reader) | **High** | Component tests, E2E tests, axe audits |
| Race conditions from rapid clicks or double-taps | **High** | Component tests, E2E tests |

### Testing Philosophy

This strategy follows the **Testing Pyramid** model:

- **Many fast, isolated unit tests** covering pure game logic -- these form the foundation and provide the fastest feedback loop.
- **Moderate number of component tests** verifying that UI modules respond correctly to state changes, with DOM assertions but no full browser.
- **Focused integration tests** confirming that the game engine, AI module, and UI renderer work together correctly.
- **A small, targeted set of E2E tests** exercising critical user journeys in a real browser via Playwright.

The ratio targets roughly **60% unit / 20% component / 10% integration / 10% E2E** by test count.

---

## 2. System Overview for Testing

### 2.1 Architectural Components

Based on the PRD's technical guidance (Section 10.1), the application should decompose into the following logical modules:

| Module | Responsibility | Purity |
|--------|---------------|--------|
| **GameEngine** | Board state management, move validation, turn alternation, win/draw detection | Pure functions operating on data structures |
| **MinimaxAI** | AI move computation using Minimax algorithm | Pure function: board state in, best move out |
| **DifficultyController** | Selects between random move and Minimax based on difficulty setting | Thin orchestrator with randomness |
| **ScoreTracker** | Tracks X wins, O wins, draws across rounds | Stateful but simple counter object |
| **UIRenderer** | DOM manipulation: renders board, status, score, screens | Side-effectful; depends on DOM |
| **GameController** | Orchestrates game flow: mode selection, turn sequencing, AI delay, restart logic | Stateful coordinator; the "glue" module |
| **AnimationManager** | CSS class toggling for move animations, win highlights, transitions | Side-effectful; DOM + CSS dependent |

### 2.2 Component Dependency Map

```
User Input (click/tap/keyboard)
        |
        v
  GameController  <---->  UIRenderer  <---->  DOM / CSS
        |                      ^
        |                      |
        v                      |
   GameEngine                  |
        |                      |
        v                      |
   MinimaxAI                   |
        |                      |
        v                      |
  DifficultyController         |
                               |
  ScoreTracker ----------------+
                               |
  AnimationManager ------------+
```

### 2.3 Risk Matrix

| Component | Business Criticality | Complexity | External Dependencies | Overall Risk |
|-----------|---------------------|------------|----------------------|-------------|
| GameEngine | **High** -- core correctness | Medium | None | **High** |
| MinimaxAI | **High** -- "Hard" must be unbeatable | High | None | **High** |
| DifficultyController | Medium | Low (randomness wrapper) | None | **Medium** |
| ScoreTracker | Medium | Low | None | **Low** |
| UIRenderer | **High** -- user-facing | Medium | DOM API | **High** |
| GameController | **High** -- orchestration bugs = broken game | High | setTimeout, DOM events | **High** |
| AnimationManager | Low (P2 feature) | Low | DOM, CSS | **Low** |

---

## 3. Unit Test Strategy

Unit tests are the foundation of this strategy. They target the pure-logic modules (GameEngine, MinimaxAI, DifficultyController, ScoreTracker) in complete isolation from the DOM.

### 3.1 Recommended Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | ^3.x | Test runner and assertion library (native ESM, Vite-aligned) |
| **@vitest/coverage-v8** | ^3.x | Code coverage via V8 (line, branch, function) |

### 3.2 Coverage Targets

| Module | Line Coverage | Branch Coverage | Rationale |
|--------|--------------|-----------------|-----------|
| GameEngine | 100% | 100% | Core correctness; small surface area; no excuse for gaps |
| MinimaxAI | 100% | 100% | Must be provably correct; a missed branch = a beatable "Hard" AI |
| DifficultyController | 95%+ | 90%+ | Randomness path is inherently harder to cover deterministically |
| ScoreTracker | 100% | 100% | Trivial module; full coverage is effortless |

### 3.3 What NOT to Unit Test

- DOM rendering (covered by component tests)
- CSS animations and transitions
- Vite configuration or build output
- Third-party library internals
- Trivial type aliases or re-exports

### 3.4 GameEngine Unit Tests

The GameEngine module manages a 9-element board array, validates moves, alternates turns, and detects win/draw conditions.

**Isolation approach**: All functions are pure. No mocks needed. Input is a board state (array of 9 values: `'X'`, `'O'`, or `null`); output is a new state or a result object.

**Test pattern**: Arrange-Act-Assert (AAA). Use parameterized tests extensively for win detection across all 8 patterns.

#### Test Scenarios

**Board State Management**

| # | Test Name | Description |
|---|-----------|-------------|
| U-GE-01 | `createBoard returns an empty 9-cell array` | Verify `createBoard()` returns `[null, null, null, null, null, null, null, null, null]`. |
| U-GE-02 | `makeMove places mark at the specified index` | Given an empty board and index 4, `makeMove(board, 4, 'X')` returns a board with `'X'` at index 4 and `null` elsewhere. |
| U-GE-03 | `makeMove does not mutate the original board` | Verify the original board array is unchanged after `makeMove` (immutability contract). |
| U-GE-04 | `makeMove rejects a move on an occupied cell` | Given a board with `'X'` at index 0, `makeMove(board, 0, 'O')` throws an error or returns null/unchanged board. |
| U-GE-05 | `makeMove rejects an out-of-bounds index` | `makeMove(board, 9, 'X')` and `makeMove(board, -1, 'X')` both throw or return error. |

**Win Detection**

| # | Test Name | Description |
|---|-----------|-------------|
| U-GE-06 | `checkWin detects top row win` | Board `['X','X','X', null,null,null, null,null,null]` returns `{winner: 'X', line: [0,1,2]}`. |
| U-GE-07 | `checkWin detects middle row win` | Board `[null,null,null, 'O','O','O', null,null,null]` returns `{winner: 'O', line: [3,4,5]}`. |
| U-GE-08 | `checkWin detects bottom row win` | Board `[null,null,null, null,null,null, 'X','X','X']` returns `{winner: 'X', line: [6,7,8]}`. |
| U-GE-09 | `checkWin detects left column win` | Board with `'O'` at indices `[0,3,6]` returns `{winner: 'O', line: [0,3,6]}`. |
| U-GE-10 | `checkWin detects middle column win` | Board with `'X'` at indices `[1,4,7]` returns `{winner: 'X', line: [1,4,7]}`. |
| U-GE-11 | `checkWin detects right column win` | Board with `'O'` at indices `[2,5,8]` returns `{winner: 'O', line: [2,5,8]}`. |
| U-GE-12 | `checkWin detects main diagonal win` | Board with `'X'` at indices `[0,4,8]` returns `{winner: 'X', line: [0,4,8]}`. |
| U-GE-13 | `checkWin detects anti-diagonal win` | Board with `'O'` at indices `[2,4,6]` returns `{winner: 'O', line: [2,4,6]}`. |
| U-GE-14 | `checkWin returns null on a board with no winner` | A partially filled board with no three-in-a-row returns `null`. |
| U-GE-15 | `checkWin returns null on an empty board` | An all-null board returns `null`. |

**Parameterized variant**: Run U-GE-06 through U-GE-13 as a single parameterized test with 8 data sets (one per winning combination), for both `'X'` and `'O'` as the winner (16 total assertions).

**Draw Detection**

| # | Test Name | Description |
|---|-----------|-------------|
| U-GE-16 | `checkDraw returns true when all cells are filled and no winner exists` | A full board with no three-in-a-row: `['X','O','X','X','O','O','O','X','X']` (no winning line) returns `true`. |
| U-GE-17 | `checkDraw returns false when cells remain empty` | A board with at least one `null` returns `false`. |
| U-GE-18 | `win on the 9th move is a win, not a draw` | A board where the 9th move completes a row: verify `checkWin` returns a winner, and the overall game status is "win" not "draw". |

**Turn Management**

| # | Test Name | Description |
|---|-----------|-------------|
| U-GE-19 | `getNextPlayer returns O when current player is X` | `getNextPlayer('X')` returns `'O'`. |
| U-GE-20 | `getNextPlayer returns X when current player is O` | `getNextPlayer('O')` returns `'X'`. |
| U-GE-21 | `getAvailableMoves returns indices of all null cells` | Given `['X',null,'O',null,null,null,null,null,null]`, returns `[1,3,4,5,6,7,8]`. |
| U-GE-22 | `getAvailableMoves returns empty array on a full board` | Returns `[]`. |

### 3.5 MinimaxAI Unit Tests

The Minimax module is a pure function: given a board state and the AI's symbol, it returns the index of the best move.

**Isolation approach**: No mocks. Feed board states directly and assert on the returned move index.

**Test pattern**: AAA with property-based assertions (e.g., "the AI never loses from this position") in addition to specific move assertions.

#### Test Scenarios

**Optimal Move Selection**

| # | Test Name | Description |
|---|-----------|-------------|
| U-AI-01 | `minimax selects the winning move when one is available` | Board: `['O','O',null, 'X','X',null, null,null,null]` with AI as `'O'`. AI must pick index 2 to win. |
| U-AI-02 | `minimax blocks the opponent's winning move` | Board: `['X','X',null, 'O',null,null, null,null,null]` with AI as `'O'`. AI must pick index 2 to block X's win. |
| U-AI-03 | `minimax prefers winning over blocking` | Board where AI can both win and block: AI chooses the winning move. Construct: `['X','O','X', null,'O',null, null,null,'X']` -- O can win at index 7 (column) but X threatens at index 6 (diagonal). AI must pick index 7. |
| U-AI-04 | `minimax takes the center on an empty board` | Given an empty board with AI as `'O'` (second player after X takes a corner), verify AI selects center (index 4) when it is the optimal response. Board: `['X',null,null, null,null,null, null,null,null]`. AI should pick index 4. |
| U-AI-05 | `minimax takes a corner as the opening move` | Given a fully empty board with AI as `'X'` (first player), the optimal first move is a corner (0, 2, 6, or 8) or center (4). Verify the returned index is one of `[0, 2, 4, 6, 8]`. |

**Unbeatable Property (Hard Difficulty)**

| # | Test Name | Description |
|---|-----------|-------------|
| U-AI-06 | `minimax never loses when playing as X from an empty board` | Simulate all possible opponent responses against minimax playing as X. The outcome for every terminal state must be a win or draw for X. (Property-based / exhaustive.) |
| U-AI-07 | `minimax never loses when playing as O from an empty board` | Simulate the human playing X first at each of the 9 positions, then minimax responds. For every possible human-game continuation, minimax never loses. (Property-based / exhaustive.) |

> **Implementation note for U-AI-06 and U-AI-07**: Because the full Tic Tac Toe game tree has fewer than 255,168 terminal states, an exhaustive recursive test that plays all possible opponent moves against the Minimax AI is computationally feasible (completes in under 2 seconds). This is the single most important test in the entire suite -- it **proves** the Hard AI is unbeatable.

**Edge Cases**

| # | Test Name | Description |
|---|-----------|-------------|
| U-AI-08 | `minimax handles a board with only one move left` | Board with 8 cells filled, one empty. AI returns the only available index. |
| U-AI-09 | `minimax returns a valid move for every possible non-terminal board state` | For a large sample of random non-terminal board states, verify minimax returns an index where `board[index] === null`. |
| U-AI-10 | `minimax score is +10 for AI win, -10 for opponent win, 0 for draw` | Verify the scoring function returns correct terminal scores. |

### 3.6 DifficultyController Unit Tests

**Isolation approach**: Mock the random number generator to make behavior deterministic. Stub `Math.random` or inject a randomness function.

#### Test Scenarios

| # | Test Name | Description |
|---|-----------|-------------|
| U-DC-01 | `Easy difficulty always returns a random valid move` | With difficulty set to Easy, the controller calls the random move selector (not minimax) on every invocation. Verify over 10 calls with varying boards that the returned move is always a valid (empty cell) index and that minimax is never invoked. |
| U-DC-02 | `Hard difficulty always returns the minimax move` | With difficulty set to Hard, the controller calls minimax on every invocation. Mock minimax to return a sentinel value; verify the controller returns it. |
| U-DC-03 | `Medium difficulty uses minimax when random >= 0.5` | Stub `Math.random` to return `0.5`. Verify the controller invokes minimax. |
| U-DC-04 | `Medium difficulty uses random move when random < 0.5` | Stub `Math.random` to return `0.49`. Verify the controller invokes the random move selector. |
| U-DC-05 | `Medium difficulty distributes roughly 50/50 over many calls` | With real randomness, call the controller 1000 times and assert the minimax-call ratio is between 40% and 60% (statistical sanity check). |
| U-DC-06 | `random move selector returns a valid move from available cells` | Given a board with 3 empty cells, the random selector returns one of those 3 indices. |
| U-DC-07 | `random move selector handles a board with one cell left` | Returns the only available index. |

### 3.7 ScoreTracker Unit Tests

| # | Test Name | Description |
|---|-----------|-------------|
| U-ST-01 | `initial scores are all zero` | `getScores()` returns `{x: 0, o: 0, draws: 0}`. |
| U-ST-02 | `recordWin for X increments X score by 1` | After `recordWin('X')`, scores are `{x: 1, o: 0, draws: 0}`. |
| U-ST-03 | `recordWin for O increments O score by 1` | After `recordWin('O')`, scores are `{x: 0, o: 1, draws: 0}`. |
| U-ST-04 | `recordDraw increments draws by 1` | After `recordDraw()`, scores are `{x: 0, o: 0, draws: 1}`. |
| U-ST-05 | `multiple recordings accumulate correctly` | After 3 X wins, 2 O wins, and 1 draw: `{x: 3, o: 2, draws: 1}`. |
| U-ST-06 | `reset sets all scores back to zero` | After recording several results, `reset()` yields `{x: 0, o: 0, draws: 0}`. |
| U-ST-07 | `scores handle large numbers without overflow` | Record 100 X wins; verify score is exactly 100. |

---

## 4. Component Test Strategy

Component tests verify that individual UI modules and the GameController behave correctly in response to state changes and user interactions. They use a lightweight DOM environment (jsdom via Vitest) or Vitest Browser Mode, but do not launch a full browser.

### 4.1 Scope Definition

A "component" in this system is a module that interacts with the DOM or coordinates multiple modules. Specifically:

- **UIRenderer**: Given a game state object, produces correct DOM output.
- **GameController**: Orchestrates game flow by wiring GameEngine, AI, ScoreTracker, and UIRenderer together.
- **AnimationManager**: Applies correct CSS classes in response to game events.

### 4.2 Boundary Management

| Dependency | Real or Mocked? | Rationale |
|------------|-----------------|-----------|
| GameEngine | **Real** | Pure functions; no reason to mock |
| MinimaxAI | **Mocked** (in GameController tests) | Avoid slow exhaustive computation; verify the controller calls AI correctly |
| DifficultyController | **Mocked** | Control which moves the AI makes to test deterministic flows |
| ScoreTracker | **Real** | Simple state object; mocking adds no value |
| DOM (jsdom) | **Real** (jsdom) | Lightweight DOM environment provided by Vitest |
| `setTimeout` | **Mocked** (`vi.useFakeTimers`) | Control AI delay timing precisely |
| `Math.random` | **Mocked** (`vi.spyOn`) | Control randomness for deterministic tests |

### 4.3 Recommended Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | ^3.x | Test runner with jsdom environment |
| **@testing-library/dom** | ^10.x | DOM querying and user interaction simulation |
| **@testing-library/user-event** | ^14.x | Realistic user event simulation (click, keyboard) |

### 4.4 UIRenderer Component Tests

#### Test Scenarios

| # | Test Name | Description |
|---|-----------|-------------|
| C-UI-01 | `renderBoard creates 9 clickable cells in a grid` | Call `renderBoard(emptyBoard)`. Assert that 9 `<button>` elements (or equivalent) with role `gridcell` exist in the DOM. |
| C-UI-02 | `renderBoard displays X and O marks in correct cells` | Given `['X',null,'O', ...]`, verify cell 0 contains text "X", cell 2 contains text "O", and cell 1 is empty. |
| C-UI-03 | `renderBoard marks occupied cells as disabled` | Cells with marks have `aria-disabled="true"` or equivalent; empty cells are interactive. |
| C-UI-04 | `renderStatus shows current player turn` | Given game state with `currentPlayer: 'X'` and `status: 'playing'`, verify the status area contains "X's Turn". |
| C-UI-05 | `renderStatus shows win message with winner identity` | Given `status: 'win'` and `winner: 'O'`, verify status contains "O Wins!". |
| C-UI-06 | `renderStatus shows draw message` | Given `status: 'draw'`, verify status contains "It's a Draw!". |
| C-UI-07 | `renderScore displays correct score values` | Given `{x: 3, o: 1, draws: 2}`, verify three score elements display the correct numbers. |
| C-UI-08 | `renderWinHighlight applies highlight class to winning cells` | Given `winLine: [0, 4, 8]`, verify cells at those indices have a `win-highlight` CSS class. |
| C-UI-09 | `renderWinHighlight does not highlight on draw` | Given `winLine: null`, verify no cells have the highlight class. |
| C-UI-10 | `Play Again button is visible after game ends` | Given `status: 'win'` or `status: 'draw'`, verify a button with text "Play Again" (or similar) is present and clickable. |
| C-UI-11 | `Play Again button is hidden during active game` | Given `status: 'playing'`, verify the "Play Again" button is not visible. |
| C-UI-12 | `mode selection screen renders two mode buttons` | On initial render, verify two buttons exist: one containing "Computer" and one containing "Player"/"Friend". |

### 4.5 GameController Component Tests

These tests verify the orchestration logic: the flow from user click to state update to re-render.

#### Test Scenarios -- AI Mode Flow

| # | Test Name | Description |
|---|-----------|-------------|
| C-GC-01 | `clicking an empty cell in AI mode places the human's mark and triggers AI response` | Setup: AI mode, Hard difficulty, human is X. Click cell 0. Assert cell 0 shows "X". Advance fake timers by 600ms. Assert one additional cell shows "O" (the AI's response). |
| C-GC-02 | `board is locked during AI thinking delay` | Setup: AI mode. Human clicks cell 0. Before the AI delay resolves, click cell 1. Assert cell 1 does NOT show a mark (input rejected during AI turn). |
| C-GC-03 | `board is locked after game ends (win)` | Play a game to a win state. Click an empty remaining cell. Assert it stays empty. |
| C-GC-04 | `board is locked after game ends (draw)` | Play a game to a draw state. Assert all cells are non-interactive. |
| C-GC-05 | `AI does not move after the human wins` | Setup: human is one move from winning. Human makes the winning move. Advance all timers. Assert only the human's mark was placed (no AI move follows). |
| C-GC-06 | `score updates after a win` | Play to an X win. Verify ScoreTracker shows `{x: 1, o: 0, draws: 0}` and the UI reflects it. |
| C-GC-07 | `score updates after a draw` | Play to a draw. Verify ScoreTracker shows `{x: 0, o: 0, draws: 1}`. |
| C-GC-08 | `New Game resets the board but preserves the score` | After a completed game with score `{x: 1, ...}`, click "Play Again". Assert board is empty, status is "X's Turn", score is still `{x: 1, ...}`. |
| C-GC-09 | `Restart during in-progress game clears the board without changing the score` | Mid-game, click Restart. Assert board is cleared, score is unchanged. |
| C-GC-10 | `restarting during AI delay cancels the pending AI move` | Human clicks cell 0, then immediately clicks Restart before the AI delay resolves. Advance timers. Assert board is empty (AI move was cancelled). |

#### Test Scenarios -- Multiplayer Mode Flow

| # | Test Name | Description |
|---|-----------|-------------|
| C-GC-11 | `clicking cells alternates between X and O in multiplayer mode` | Click cell 0: shows "X". Click cell 4: shows "O". Click cell 8: shows "X". No AI involvement. |
| C-GC-12 | `clicking an occupied cell in multiplayer mode does nothing` | Click cell 0 (places X). Click cell 0 again. Assert cell 0 still shows "X" and turn has not changed. |
| C-GC-13 | `status indicator alternates correctly in multiplayer` | After each click, verify the status text switches between "X's Turn" and "O's Turn". |

#### Test Scenarios -- Mode and Difficulty Selection

| # | Test Name | Description |
|---|-----------|-------------|
| C-GC-14 | `selecting vs Computer mode shows difficulty selection` | Click the "vs Computer" button. Assert the difficulty selection UI (Easy/Medium/Hard) is displayed. |
| C-GC-15 | `selecting vs Player mode goes directly to the game board` | Click the "vs Player" button. Assert the game board is displayed with no difficulty selection step. |
| C-GC-16 | `selecting difficulty starts the AI game` | Click "vs Computer", then "Hard". Assert the game board is displayed and the status shows "X's Turn". |
| C-GC-17 | `Back to Menu resets score and returns to mode selection` | From a game screen with score `{x: 2, o: 1, draws: 0}`, click "Back to Menu". Assert the mode selection screen is displayed. Start a new game. Assert score is `{x: 0, o: 0, draws: 0}`. |

#### Test Scenarios -- Player Symbol Choice (F14)

| # | Test Name | Description |
|---|-----------|-------------|
| C-GC-18 | `choosing O in AI mode triggers AI to make the first move as X` | Select AI mode, Hard difficulty, human chooses O. Assert the AI makes a move as X after the delay (one cell is filled with "X"). |
| C-GC-19 | `score correctly attributes wins when human plays as O` | Human plays as O and wins. Assert ScoreTracker increments O wins, and the UI displays "O Wins!". |

### 4.6 Accessibility Component Tests

| # | Test Name | Description |
|---|-----------|-------------|
| C-A11Y-01 | `all board cells are keyboard-focusable` | Verify each cell can be reached via Tab key and has a visible focus indicator. |
| C-A11Y-02 | `pressing Enter or Space on a focused empty cell places a mark` | Focus cell 4, press Enter. Assert cell 4 shows the current player's mark. |
| C-A11Y-03 | `game board has appropriate ARIA grid role` | Verify the board container has `role="grid"` and cells have `role="gridcell"`. |
| C-A11Y-04 | `screen reader announcements fire for move placement` | After a move, verify an `aria-live` region announces the move (e.g., "X placed at row 1, column 2"). |
| C-A11Y-05 | `screen reader announcements fire for game outcome` | After a win, verify an `aria-live` region announces "X Wins!" or equivalent. |
| C-A11Y-06 | `game does not rely solely on color to convey state` | Win highlights include a pattern, icon, or text supplement beyond color change. (Manual review augmented by axe audit.) |

---

## 5. Integration Test Strategy

Integration tests verify that multiple real modules work together correctly. In this client-side application, "integration" means testing the GameController with the real GameEngine, real MinimaxAI, and real UIRenderer (in jsdom), without mocking internal modules.

### 5.1 Integration Points

| Integration Point | Modules Involved | Risk |
|-------------------|-----------------|------|
| Human move -> engine -> renderer | GameController + GameEngine + UIRenderer | High |
| Human move -> engine -> AI -> engine -> renderer | GameController + GameEngine + MinimaxAI + DifficultyController + UIRenderer | **Critical** |
| Game outcome -> score tracker -> renderer | GameController + GameEngine + ScoreTracker + UIRenderer | Medium |
| Mode/difficulty selection -> controller initialization | UIRenderer + GameController | Medium |
| AI delay timing -> renderer update | GameController (setTimeout) + UIRenderer | Medium |

### 5.2 Test Environment

- **Vitest with jsdom** environment (same as component tests, but no mocks on internal modules).
- **`vi.useFakeTimers()`** is still used to control `setTimeout` for AI delay, as real-time delays would make tests slow and flaky.
- **`Math.random` is NOT mocked** in most integration tests (except where deterministic behavior is needed for assertion).

### 5.3 Integration Test Scenarios

| # | Test Name | Description |
|---|-----------|-------------|
| I-01 | `full AI game at Hard difficulty ends in draw when human plays optimally` | Start a Hard-mode AI game. Human plays an optimal strategy (e.g., corners + center). Verify the game ends in a draw, not a win for either side. |
| I-02 | `full AI game at Easy difficulty allows human to win` | Seed `Math.random` to produce specific random moves. Human plays to exploit the random AI. Verify human wins. |
| I-03 | `AI responds with a valid move to every human opening move` | For each of the 9 cells, start a new game, human plays that cell, verify the AI responds with a different valid cell. |
| I-04 | `score accumulates correctly across 3 consecutive games` | Play 3 games (1 X win, 1 O win, 1 draw). Verify final score is `{x: 1, o: 1, draws: 1}` and the UI displays these values. |
| I-05 | `switching from AI mode to multiplayer mode resets state cleanly` | Play an AI game to completion. Navigate back to menu. Select multiplayer mode. Verify board is empty, score is zero, no AI delay is pending. |
| I-06 | `win detection and highlight work end-to-end for all 8 winning lines` | Parameterized: for each of the 8 winning combinations, construct a game where that line wins. Verify the win is detected, the correct message is shown, and the correct 3 cells are highlighted. |
| I-07 | `rapid clicking during AI mode does not corrupt game state` | Start AI game. Human clicks cell 0. Before the AI delay resolves, rapidly click cells 1, 2, 3, 4. Advance timers. Verify only cell 0 has the human's mark, exactly one cell has the AI's mark, and the turn state is consistent. |

---

## 6. End-to-End (E2E) Test Strategy

E2E tests run in a real browser (Chromium, Firefox, WebKit) via Playwright. They verify complete user journeys from opening the app to finishing games, as a real user would experience them.

### 6.1 Recommended Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **Playwright** | ^1.50.x | Cross-browser E2E test runner |
| **@playwright/test** | ^1.50.x | Test assertions and fixtures |

### 6.2 Test Environment Requirements

- **Dev server**: Vite dev server (started automatically by Playwright config via `webServer` option).
- **Browsers**: Chromium, Firefox, WebKit (all three for cross-browser coverage).
- **Viewports**: Desktop (1280x720), Tablet (768x1024), Mobile (375x667).
- **No external services**: The app is fully client-side; no test database or API mocking needed.

### 6.3 Data Isolation

Each test starts by navigating to the app's root URL, which resets all state (since state is in-memory). No cleanup is needed between tests beyond a fresh page load.

### 6.4 Flakiness Mitigation

- **Use Playwright's auto-waiting**: All `locator.click()` and `expect(locator)` calls auto-wait for elements to be visible and stable.
- **Avoid fixed `waitForTimeout`**: Use `expect(locator).toBeVisible()` or `expect(locator).toHaveText()` instead.
- **For AI delay**: Wait for the AI's mark to appear using `expect(cell).toHaveText('O')` with Playwright's default timeout (30s) rather than hardcoded waits.
- **Stable selectors**: Use `data-testid` attributes (e.g., `data-testid="cell-0"`, `data-testid="btn-play-again"`, `data-testid="score-x"`).
- **Retry on CI**: Configure `retries: 2` in CI to absorb rare flakes.

### 6.5 E2E Test Scenarios

#### Scenario E2E-01: Complete AI Game at Hard Difficulty (Human as X, Resulting in Draw)

**Priority**: Critical
**Browsers**: Chromium, Firefox, WebKit
**Viewport**: Desktop

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app root URL | Mode selection screen is visible with two mode options |
| 2 | Click "vs Computer" | Difficulty selection is shown (Easy, Medium, Hard) |
| 3 | Click "Hard" | Game board appears with 9 empty cells. Status shows "X's Turn" |
| 4 | Click cell 0 (top-left corner) | Cell 0 shows "X". Status shows "O's Turn" (or AI thinking indicator) |
| 5 | Wait for AI move | One cell now shows "O". Status shows "X's Turn" |
| 6 | Continue playing optimal moves (center, corners) | Game alternates correctly |
| 7 | Game reaches terminal state | Status shows "It's a Draw!". Board is locked. "Play Again" button is visible |
| 8 | Verify score display | Score shows X: 0, O: 0, Draws: 1 |

#### Scenario E2E-02: Complete AI Game at Easy Difficulty (Human Wins)

**Priority**: Critical
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app root URL | Mode selection screen is visible |
| 2 | Click "vs Computer", then "Easy" | Game board appears |
| 3 | Play strategically (take center, build two threats) | Human eventually completes three in a row |
| 4 | On human win | Status shows "X Wins!". Three cells are highlighted as the winning line. Board is locked |
| 5 | Verify score | X: 1, O: 0, Draws: 0 |

> **Note**: Because Easy AI uses random moves, there is a small chance it accidentally blocks the human or wins. The test should structure moves to minimize this possibility (e.g., take center and two corners immediately). If the test becomes flaky, seed randomness or accept a statistical approach (run 5 times, expect at least 3 human wins).

#### Scenario E2E-03: Local Multiplayer Full Game (X Wins)

**Priority**: Critical
**Browsers**: Chromium, WebKit

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app root URL | Mode selection screen |
| 2 | Click "vs Player" | Game board appears. Status: "X's Turn" |
| 3 | Click cell 0 | Cell 0 shows "X". Status: "O's Turn" |
| 4 | Click cell 3 | Cell 3 shows "O". Status: "X's Turn" |
| 5 | Click cell 1 | Cell 1 shows "X". Status: "O's Turn" |
| 6 | Click cell 4 | Cell 4 shows "O". Status: "X's Turn" |
| 7 | Click cell 2 | Cell 2 shows "X". Top row highlighted. Status: "X Wins!" |
| 8 | Verify board is locked | Click cell 5 (empty). Cell 5 stays empty |
| 9 | Verify score | X: 1, O: 0, Draws: 0 |

#### Scenario E2E-04: Local Multiplayer Draw

**Priority**: High
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Player" | Game board appears |
| 2 | Play moves in this order: X=0, O=4, X=8, O=2, X=6, O=3, X=5, O=1, X=7 | Produces a drawn board: `X O X / O O X / X X O` |
| 3 | Game ends | Status: "It's a Draw!". No cells are highlighted. "Play Again" visible |
| 4 | Verify score | X: 0, O: 0, Draws: 1 |

#### Scenario E2E-05: Play Again Preserves Score and Settings

**Priority**: High
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Player" | Board appears |
| 2 | Play to X win (top row: cells 0,1,2 for X; cells 3,4 for O) | Score: X: 1, O: 0, Draws: 0 |
| 3 | Click "Play Again" | Board is cleared. Status: "X's Turn". Score: still X: 1. Still in multiplayer mode |
| 4 | Play to O win (left column: cells 0,3,6 for O; cells 1,4 for X) | Score: X: 1, O: 1, Draws: 0 |
| 5 | Click "Play Again" | Score preserved: X: 1, O: 1, Draws: 0 |

#### Scenario E2E-06: Back to Menu Resets Score

**Priority**: High
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Player" | Board appears |
| 2 | Play to X win | Score: X: 1, O: 0, Draws: 0 |
| 3 | Click "Back to Menu" (or equivalent) | Mode selection screen appears |
| 4 | Select "vs Player" again | Board appears. Score: X: 0, O: 0, Draws: 0 (reset) |

#### Scenario E2E-07: AI Plays First When Human Chooses O

**Priority**: High
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Computer", Hard difficulty | Symbol choice appears (or is integrated with difficulty) |
| 2 | Choose "O" | Game board appears. AI makes the first move as X (one cell shows "X"). Status: "O's Turn" |
| 3 | Human clicks an empty cell | Cell shows "O". AI responds with "X" |
| 4 | Continue to game end | Game completes correctly with swapped symbols |

#### Scenario E2E-08: Occupied Cell Rejects Click

**Priority**: Medium
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Player" | Board appears |
| 2 | Click cell 4 | Cell 4 shows "X". Status: "O's Turn" |
| 3 | Click cell 4 again | Nothing changes. Cell 4 still shows "X". Status still: "O's Turn" |

#### Scenario E2E-09: Mobile Viewport Game Flow

**Priority**: High
**Browsers**: Chromium (Mobile)
**Viewport**: 375x667 (iPhone SE)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app root URL at 375x667 | Mode selection screen fits viewport. No horizontal scroll. Buttons are touch-friendly (>= 48x48px) |
| 2 | Tap "vs Player" | Board fits viewport. Cells are large enough to tap accurately |
| 3 | Play a full game | All cells, status text, and score are visible without scrolling. Game functions correctly |
| 4 | Tap "Play Again" | Board resets correctly on mobile |

#### Scenario E2E-10: Restart Mid-Game Clears Board Without Affecting Score

**Priority**: Medium
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Player", play 3 moves | Board has X in cell 0, O in cell 4, X in cell 8 |
| 2 | Click "Restart" (or equivalent in-game reset) | Board is cleared. Status: "X's Turn". Score remains unchanged (no win/loss/draw recorded) |

#### Scenario E2E-11: Difficulty Switch Between Games

**Priority**: Medium
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate, select "vs Computer", Easy | Play and finish a game |
| 2 | Change difficulty to Hard (via in-game UI) | New game starts at Hard difficulty |
| 3 | Play against Hard AI | AI plays optimally (game should end in draw with optimal human play) |

#### Scenario E2E-12: Keyboard-Only Navigation and Play

**Priority**: High
**Browsers**: Chromium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app root URL | Mode selection screen |
| 2 | Tab to "vs Player" button, press Enter | Game board appears |
| 3 | Tab to cell 0, press Enter | Cell 0 shows "X" |
| 4 | Tab to cell 4, press Enter | Cell 4 shows "O" |
| 5 | Continue via keyboard to game end | Game completes successfully using only keyboard input |
| 6 | Tab to "Play Again", press Enter | Board resets |

---

## 7. Non-Functional Testing

### 7.1 Performance Testing

**Approach**: Lighthouse CI audits on every merge to main, plus manual profiling during development.

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance Score | >= 90 (mobile) | Lighthouse CI |
| Largest Contentful Paint (LCP) | < 1.5s (4G mobile) | Lighthouse CI |
| Interaction to Next Paint (INP) | < 100ms | Lighthouse CI, manual DevTools |
| Total Bundle Size (gzipped) | < 50KB | Vite build output analysis |
| Minimax computation time | < 10ms | Unit test with `performance.now()` timing |

**Minimax Performance Test**:

| # | Test Name | Description |
|---|-----------|-------------|
| P-01 | `minimax completes within 10ms on an empty board` | Call minimax on an empty board (worst case: maximum game tree). Assert `performance.now()` delta is under 10ms. |
| P-02 | `minimax completes within 1ms on a board with 5 marks` | Call minimax on a mid-game board. Assert sub-1ms completion. |

### 7.2 Security Testing

The attack surface is minimal (no backend, no user input beyond cell clicks, no data storage). However:

| Check | Tool | Frequency |
|-------|------|-----------|
| Dependency vulnerability scan | `npm audit` | Every CI run |
| Content Security Policy validation | Manual review + Lighthouse | Before each release |
| No inline scripts or eval | ESLint rule `no-eval`, CSP `script-src` | CI (linting) |

### 7.3 Accessibility Testing

| Check | Tool | Frequency |
|-------|------|-----------|
| Automated a11y audit (WCAG 2.1 AA) | `axe-core` via `@axe-core/playwright` | E2E test suite (every PR) |
| Color contrast validation | Lighthouse accessibility audit | Every merge to main |
| Keyboard navigation | E2E-12 (manual + automated) | Every PR |
| Screen reader testing | Manual with VoiceOver/NVDA | Before each release |
| `prefers-reduced-motion` respected | Manual verification + unit test | Before each release |

**Axe Integration in Playwright**:

```typescript
// Example: axe audit in Playwright E2E test
import AxeBuilder from '@axe-core/playwright';

test('mode selection screen has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('game board has no accessibility violations during play', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('btn-vs-player').click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('game over screen has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  // ... play to completion
  const results = await new AxeBuilder({ page })
    .exclude('.animation-container') // Exclude transient animations
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### 7.4 Visual Regression Testing

**Optional but recommended** to catch unintended layout shifts, especially for responsive design.

| Tool | Purpose |
|------|---------|
| **Playwright screenshot comparison** | Built-in `expect(page).toHaveScreenshot()` for visual diffs |

Capture baseline screenshots for:
- Mode selection screen (desktop, tablet, mobile)
- Game board (empty, mid-game, X wins, O wins, draw)
- Difficulty selection screen

---

## 8. Test Pyramid Summary

```
                    /\
                   /  \          E2E Tests
                  / 12  \        (Playwright, real browser)
                 / tests \       ~10% of suite
                /----------\
               /            \    Integration Tests
              /    ~15       \   (Vitest + jsdom, real modules)
             /    tests       \  ~10% of suite
            /------------------\
           /                    \  Component Tests
          /      ~30 tests       \ (Vitest + jsdom + testing-library)
         /                        \ ~20% of suite
        /--------------------------\
       /                            \ Unit Tests
      /        ~50-60 tests          \ (Vitest, pure logic, no DOM)
     /                                \ ~60% of suite
    /----------------------------------\
```

### Distribution Rationale

| Layer | Approximate Count | Execution Time | Rationale |
|-------|-------------------|---------------|-----------|
| **Unit** | 50-60 tests | < 2 seconds total | Core game logic must be provably correct. Pure functions are cheap to test exhaustively. The minimax unbeatable proof (U-AI-06, U-AI-07) is the single most valuable test. |
| **Component** | ~30 tests | < 5 seconds total | UI state transitions are a major risk area (input locking, turn management, screen transitions). Testing in jsdom is fast but catches real bugs. |
| **Integration** | ~15 tests | < 5 seconds total | Verifies the modules actually work together. Catches wiring bugs that unit and component tests miss (e.g., wrong function signature, incorrect event handling). |
| **E2E** | ~12 tests | 30-60 seconds total | Covers the critical user journeys in a real browser. Deliberately kept small to avoid maintenance burden and flakiness. |

---

## 9. CI/CD Integration

### 9.1 Pipeline Stages

```
 Commit Push          Pull Request              Merge to Main           Nightly
     |                     |                          |                    |
     v                     v                          v                    v
 +---------+        +-------------+           +--------------+      +----------+
 | Lint +  |        | All of left |           | All of left  |      | Full E2E |
 | Type    |        | +           |           | +            |      | (3       |
 | Check   |        | Component   |           | E2E          |      | browsers |
 | +       |        | Tests       |           | (Chromium)   |      | x 3      |
 | Unit    |        | +           |           | +            |      | viewports|
 | Tests   |        | Integration |           | Lighthouse   |      | )        |
 |         |        | Tests       |           | CI           |      |          |
 +---------+        +-------------+           +--------------+      +----------+
   ~5 sec             ~15 sec                   ~90 sec               ~5 min
```

### 9.2 Stage Details

| Stage | Trigger | Tests Run | Max Duration | Failure Action |
|-------|---------|-----------|-------------|----------------|
| **Pre-commit** (local) | `git commit` (via Husky + lint-staged) | ESLint, TypeScript type check | 10 seconds | Block commit |
| **On Push** | Every push to any branch | Lint + Type Check + Unit Tests | 30 seconds | Block further stages |
| **On PR** | Pull request opened/updated | Unit + Component + Integration | 60 seconds | Block merge |
| **On Merge to Main** | Merge commit to `main` | Full suite: Unit + Component + Integration + E2E (Chromium) + Lighthouse | 2 minutes | Alert team; consider revert |
| **Nightly** | Cron (daily at 02:00 UTC) | Full E2E across 3 browsers x 3 viewports + a11y audits | 5 minutes | Create issue if failures |

### 9.3 Parallelization

- **Unit, Component, and Integration tests**: Run in a single Vitest process with worker threads. No special parallelization needed (total time < 15 seconds).
- **E2E tests**: Use Playwright's built-in parallelism (`workers: 4` in CI). Each test file runs in its own worker.
- **Cross-browser E2E**: Run Chromium, Firefox, and WebKit projects in parallel via Playwright's `projects` config.

### 9.4 Configuration Snippets

**`vitest.config.ts`** (relevant sections):

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        // Enforce coverage minimums
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/main.ts'],
    },
  },
});
```

**`playwright.config.ts`** (relevant sections):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

---

## 10. Test Data Management Strategy

### 10.1 Overview

This application has no database or persistent storage. All "test data" consists of board state arrays and configuration objects constructed inline within each test.

### 10.2 Board State Factories

Create a shared test utility module that provides factory functions for common board states:

```typescript
// src/test-utils/board-factories.ts

export const boards = {
  empty: () => Array(9).fill(null),

  xWinsTopRow: () => ['X', 'X', 'X', 'O', 'O', null, null, null, null],
  oWinsLeftCol: () => ['O', 'X', null, 'O', 'X', null, 'O', null, null],
  xWinsDiagonal: () => ['X', 'O', null, null, 'X', 'O', null, null, 'X'],
  oWinsAntiDiag: () => ['X', null, 'O', 'X', 'O', null, 'O', null, null],

  draw: () => ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],

  oneMoveLeft: (lastIndex: number, lastPlayer: 'X' | 'O') => {
    // Returns a board with one cell empty and the rest filled
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    board[lastIndex] = null;
    return board;
  },

  // AI-specific boards
  aiCanWin: () => ['O', 'O', null, 'X', 'X', null, null, null, null],
  aiMustBlock: () => ['X', 'X', null, 'O', null, null, null, null, null],
};
```

### 10.3 Winning Combinations Data

```typescript
// src/test-utils/win-combinations.ts

export const WIN_COMBINATIONS = [
  { name: 'top row',       indices: [0, 1, 2] },
  { name: 'middle row',    indices: [3, 4, 5] },
  { name: 'bottom row',    indices: [6, 7, 8] },
  { name: 'left column',   indices: [0, 3, 6] },
  { name: 'middle column', indices: [1, 4, 7] },
  { name: 'right column',  indices: [2, 5, 8] },
  { name: 'main diagonal', indices: [0, 4, 8] },
  { name: 'anti-diagonal', indices: [2, 4, 6] },
];
```

### 10.4 E2E Test Data

For E2E tests, predefined move sequences ensure deterministic game outcomes:

```typescript
// e2e/fixtures/game-sequences.ts

export const sequences = {
  xWinsTopRow: {
    // Multiplayer mode: X plays top row, O plays middle row
    moves: [0, 3, 1, 4, 2], // X, O, X, O, X (X wins after 5th move)
    expectedWinner: 'X',
    expectedLine: [0, 1, 2],
  },
  draw: {
    // Move order that produces a draw
    moves: [0, 4, 8, 2, 6, 3, 5, 1, 7],
    expectedWinner: null,
  },
  oWinsLeftCol: {
    moves: [1, 0, 4, 3, 8, 6], // X, O, X, O, X, O (O wins after 6th move)
    expectedWinner: 'O',
    expectedLine: [0, 3, 6],
  },
};
```

### 10.5 Sensitive Data

There is no sensitive data in this application. No PII, no credentials, no API keys. All test data is constructed from game-state primitives.

---

## 11. Tooling Summary Table

| Layer | Tool | Version | Purpose | Justification |
|-------|------|---------|---------|---------------|
| **Unit** | Vitest | ^3.x | Test runner, assertions, mocking | Native Vite integration; fast ESM-first execution; built-in coverage |
| **Unit** | @vitest/coverage-v8 | ^3.x | Code coverage | V8-based; accurate; low overhead |
| **Component** | Vitest (jsdom) | ^3.x | DOM environment for component tests | Lightweight; runs in Node; no browser overhead |
| **Component** | @testing-library/dom | ^10.x | DOM querying, user event simulation | Best-practice DOM testing; encourages accessible selectors |
| **Component** | @testing-library/user-event | ^14.x | Realistic user interaction simulation | More realistic than `fireEvent`; handles focus, keyboard, click sequences |
| **E2E** | Playwright | ^1.50.x | Cross-browser E2E testing | Multi-browser support; auto-waiting; excellent trace/debug tools |
| **E2E** | @axe-core/playwright | ^4.x | Accessibility audits in E2E | Industry-standard a11y rule engine; integrates natively with Playwright |
| **Performance** | Lighthouse CI | ^0.14.x | Performance and a11y audits in CI | Google's standard; matches PRD KPI definitions exactly |
| **Linting** | ESLint | ^9.x | Static analysis | Catches bugs before tests run |
| **Type Checking** | TypeScript | ^5.x | Static type checking | Prevents entire categories of runtime errors |
| **Git Hooks** | Husky | ^9.x | Pre-commit hook management | Ensures lint + type-check pass before code enters the repo |
| **Git Hooks** | lint-staged | ^15.x | Run linters on staged files only | Fast pre-commit checks |

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1) -- Effort: Low

**Goal**: Set up the testing infrastructure so every line of code written from here on is immediately testable.

| Task | Priority | Effort |
|------|----------|--------|
| Install and configure Vitest with jsdom and coverage | Critical | Low |
| Install and configure Playwright with Chromium project | Critical | Low |
| Create `src/test-utils/board-factories.ts` with shared fixtures | High | Low |
| Create `src/test-utils/win-combinations.ts` | High | Low |
| Configure ESLint with TypeScript rules | High | Low |
| Set up Husky + lint-staged for pre-commit hooks | Medium | Low |
| Add npm scripts: `test`, `test:unit`, `test:component`, `test:e2e`, `test:coverage` | High | Low |

### Phase 2: Core Logic Tests (Week 1-2) -- Effort: Medium

**Goal**: Achieve 100% coverage on GameEngine and MinimaxAI before writing any UI code. This is the test-driven development phase for the most critical modules.

| Task | Priority | Effort |
|------|----------|--------|
| Write all GameEngine unit tests (U-GE-01 through U-GE-22) | **Critical** | Medium |
| Write MinimaxAI unit tests (U-AI-01 through U-AI-10), including the exhaustive unbeatable proof | **Critical** | Medium |
| Write DifficultyController unit tests (U-DC-01 through U-DC-07) | High | Low |
| Write ScoreTracker unit tests (U-ST-01 through U-ST-07) | High | Low |
| Write Minimax performance tests (P-01, P-02) | Medium | Low |

### Phase 3: Component and Integration Tests (Week 2-3) -- Effort: Medium

**Goal**: Cover all UI state transitions and module wiring as the UI is built.

| Task | Priority | Effort |
|------|----------|--------|
| Write UIRenderer component tests (C-UI-01 through C-UI-12) | High | Medium |
| Write GameController component tests (C-GC-01 through C-GC-19) | **Critical** | Medium |
| Write accessibility component tests (C-A11Y-01 through C-A11Y-06) | High | Medium |
| Write integration tests (I-01 through I-07) | High | Medium |

### Phase 4: E2E Tests (Week 3) -- Effort: Medium

**Goal**: Verify complete user journeys in real browsers.

| Task | Priority | Effort |
|------|----------|--------|
| Write critical E2E scenarios (E2E-01 through E2E-07) | **Critical** | Medium |
| Write supplementary E2E scenarios (E2E-08 through E2E-12) | High | Low |
| Add axe accessibility audits to E2E suite | High | Low |
| Add visual regression screenshots (baseline capture) | Medium | Low |
| Configure cross-browser projects (Firefox, WebKit, mobile) | Medium | Low |

### Phase 5: CI/CD and Polish (Week 3-4) -- Effort: Low

**Goal**: Automate everything so the test suite runs on every commit and PR.

| Task | Priority | Effort |
|------|----------|--------|
| Configure CI pipeline (GitHub Actions) with staged test execution | High | Low |
| Add Lighthouse CI to merge-to-main pipeline | Medium | Low |
| Configure nightly cross-browser E2E run | Medium | Low |
| Review and adjust coverage thresholds based on actual codebase | Medium | Low |
| Document testing conventions in a CONTRIBUTING.md section | Low | Low |

---

## Appendix A: Recommended File Structure

```
tic-tac-toe/
  src/
    engine/
      game-engine.ts
      game-engine.test.ts
      minimax.ts
      minimax.test.ts
      difficulty-controller.ts
      difficulty-controller.test.ts
    state/
      score-tracker.ts
      score-tracker.test.ts
    ui/
      renderer.ts
      renderer.test.ts
      animation-manager.ts
      animation-manager.test.ts
    controller/
      game-controller.ts
      game-controller.test.ts           # Component + integration tests
    test-utils/
      board-factories.ts
      win-combinations.ts
    main.ts
  e2e/
    fixtures/
      game-sequences.ts
    ai-game.spec.ts                     # E2E-01, E2E-02, E2E-07, E2E-11
    multiplayer-game.spec.ts            # E2E-03, E2E-04, E2E-08
    navigation.spec.ts                  # E2E-05, E2E-06, E2E-10
    mobile.spec.ts                      # E2E-09
    accessibility.spec.ts               # E2E-12, axe audits
  docs/
    PRD.md
    test-strategy.md
  vitest.config.ts
  playwright.config.ts
  package.json
  tsconfig.json
```

## Appendix B: Self-Verification Checklist

- [x] All system components from the PRD are addressed in at least one test layer (GameEngine, MinimaxAI, DifficultyController, ScoreTracker, UIRenderer, GameController, AnimationManager)
- [x] All integration points have corresponding integration test scenarios (I-01 through I-07)
- [x] At least 3 concrete E2E scenarios for the most critical user journeys (E2E-01 through E2E-12, with 12 total)
- [x] Tooling recommendations are consistent with the stack (Vitest for Vite+TS; Playwright for cross-browser E2E)
- [x] Test pyramid rationale is clearly explained (Section 8)
- [x] CI/CD integration guidance is actionable with stage definitions and config snippets (Section 9)
- [x] Non-functional testing is addressed: performance (Lighthouse, minimax timing), security (npm audit, CSP), accessibility (axe-core, keyboard nav, screen reader), visual regression (Section 7)
- [x] All 14 features from the PRD (F1-F14) have corresponding test coverage across the strategy
- [x] Edge cases from the PRD are addressed: rapid double-tap (C-GC-02, I-07), win on 9th move (U-GE-18), restart during AI delay (C-GC-10), AI not moving after human wins (C-GC-05)
