/**
 * Application-wide constants: WIN_LINES, INITIAL_STATE, and configuration values.
 */

import type { GameState } from './types';

// ── Winning Combinations ───────────────────────────────────────────────────────

export const WIN_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
] as const;

// ── AI Configuration ───────────────────────────────────────────────────────────

/** Artificial delay range for AI move (milliseconds). Creates a natural feel. */
export const AI_DELAY_MIN = 300;
export const AI_DELAY_MAX = 600;

/** Probability that Medium AI uses Minimax (vs random). */
export const MEDIUM_MINIMAX_PROBABILITY = 0.5;

// ── Initial State ──────────────────────────────────────────────────────────────

export const INITIAL_STATE: GameState = {
  screen: 'menu',
  mode: 'ai',
  difficulty: 'medium',
  humanSymbol: 'X',
  board: Object.freeze(Array(9).fill(null)),
  currentPlayer: 'X',
  result: 'playing',
  winningLine: null,
  isAITurn: false,
  aiTimerID: null,
  scores: { x: 0, o: 0, draws: 0 },
  roundNumber: 0,
} as const;
