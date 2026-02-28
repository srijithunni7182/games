/**
 * All TypeScript types and interfaces for the Tic Tac Toe application.
 * This is the single source of truth for all data shapes.
 */

// ── Primitives ─────────────────────────────────────────────────────────────────

export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';
export type Board = readonly CellValue[]; // Always 9 elements, indexed 0-8
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ai' | 'multiplayer';
export type Screen = 'menu' | 'setup' | 'game';
export type GameResult = 'playing' | 'win-x' | 'win-o' | 'draw';

// ── Board Layout ───────────────────────────────────────────────────────────────
//
//  0 | 1 | 2
// -----------
//  3 | 4 | 5
// -----------
//  6 | 7 | 8

// ── Game State ─────────────────────────────────────────────────────────────────

export interface GameState {
  // Screen navigation
  readonly screen: Screen;

  // Game settings
  readonly mode: GameMode;
  readonly difficulty: Difficulty;
  readonly humanSymbol: Player; // Which symbol the human chose (AI mode)

  // Board state
  readonly board: Board;
  readonly currentPlayer: Player;
  readonly result: GameResult;
  readonly winningLine: readonly number[] | null;

  // AI state
  readonly isAITurn: boolean; // True while waiting for AI move
  readonly aiTimerID: number | null; // setTimeout ID for cancellation

  // Score tracking
  readonly scores: {
    readonly x: number;
    readonly o: number;
    readonly draws: number;
  };

  // Multiplayer turn alternation
  readonly roundNumber: number; // Increments each round; determines first player in multiplayer
}

// ── Actions ────────────────────────────────────────────────────────────────────

export type Action =
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

// ── Store ──────────────────────────────────────────────────────────────────────

export type Subscriber = (state: GameState) => void;
export type Dispatch = (action: Action) => void;

export interface Store {
  getState: () => GameState;
  dispatch: Dispatch;
  subscribe: (fn: Subscriber) => () => void;
}
