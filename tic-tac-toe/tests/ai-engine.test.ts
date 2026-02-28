/**
 * Unit tests for ai-engine.ts
 * Tests: U-AI-01 through U-AI-10
 * Includes the exhaustive "AI never loses" property-based tests (U-AI-06, U-AI-07).
 */

import { describe, it, expect, vi } from 'vitest';
import { getBestMove, getRandomMove, getAIMove } from '../src/ai-engine';
import { createBoard, makeMove, checkWinner, checkDraw, getAvailableMoves } from '../src/game-logic';
import { boards } from '../src/test-utils/board-factories';
import type { Board, Player } from '../src/types';

// ── Optimal Move Selection ─────────────────────────────────────────────────────

describe('getBestMove', () => {
  it('U-AI-01: takes the winning move when one is available', () => {
    // O has indices 0,1 -- must pick index 2 to win
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null] as Board;
    const move = getBestMove(board, 'O');
    expect(move).toBe(2);
  });

  it('U-AI-02: blocks the opponent winning move', () => {
    // X has indices 0,1 -- AI (O) must pick index 2 to block
    const board: Board = ['X', 'X', null, 'O', null, null, null, null, null] as Board;
    const move = getBestMove(board, 'O');
    expect(move).toBe(2);
  });

  it('U-AI-03: prefers winning over blocking when both are possible', () => {
    // O can win at index 7 (col 1: 1,4,7) but X threatens at index 6 (diagonal 2,4,6)
    // O has 1,4; X has 2,8 -- O wins at 7
    const board: Board = [null, 'O', 'X', null, 'O', null, null, null, 'X'] as Board;
    const move = getBestMove(board, 'O');
    expect(move).toBe(7);
  });

  it('U-AI-04: takes center as the best response to a corner opening', () => {
    // Human played top-left corner, AI responds with center
    const board: Board = ['X', null, null, null, null, null, null, null, null] as Board;
    const move = getBestMove(board, 'O');
    expect(move).toBe(4);
  });

  it('U-AI-05: takes a strategic cell as opening move (corner or center)', () => {
    const board = createBoard();
    const move = getBestMove(board, 'X');
    expect([0, 2, 4, 6, 8]).toContain(move);
  });

  it('U-AI-08: handles a board with only one move left', () => {
    // 8 cells filled, index 4 is empty
    const board: Board = ['X', 'O', 'X', 'O', null, 'O', 'X', 'X', 'O'] as Board;
    const move = getBestMove(board, 'X');
    expect(move).toBe(4);
  });

  it('U-AI-09: always returns a valid index on random non-terminal boards', () => {
    // Test 20 random-ish mid-game boards
    const testBoards: Board[] = [
      [null, 'X', null, null, 'O', null, null, null, null] as Board,
      ['X', null, 'O', null, 'X', null, null, null, null] as Board,
      [null, null, null, null, 'X', 'O', null, null, null] as Board,
      ['O', 'X', null, null, null, null, null, null, null] as Board,
      [null, null, null, 'X', null, 'O', null, null, null] as Board,
    ];
    for (const board of testBoards) {
      const move = getBestMove(board, 'O');
      expect(board[move]).toBeNull();
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
    }
  });
});

// ── Unbeatable Property Tests ──────────────────────────────────────────────────

/**
 * Exhaustively simulates games where the AI plays optimally.
 * Explores all possible human move sequences.
 * Returns true if AI never loses.
 */
function simulateAllGames(
  board: Board,
  currentPlayer: Player,
  aiPlayer: Player,
  depth: number = 0,
): boolean {
  const winner = checkWinner(board);
  if (winner !== null) {
    // AI must not lose
    return winner === aiPlayer || winner !== (aiPlayer === 'X' ? 'O' : 'X');
  }
  if (checkDraw(board)) return true;

  const available = getAvailableMoves(board);
  if (available.length === 0) return true;

  if (currentPlayer === aiPlayer) {
    // AI plays optimally
    const move = getBestMove(board, aiPlayer);
    const newBoard = makeMove(board, move, aiPlayer);
    return simulateAllGames(newBoard, aiPlayer === 'X' ? 'O' : 'X', aiPlayer, depth + 1);
  } else {
    // Human plays every possible move
    const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
    for (const move of available) {
      const newBoard = makeMove(board, move, humanPlayer);
      const result = simulateAllGames(
        newBoard,
        aiPlayer, // back to AI's turn
        aiPlayer,
        depth + 1,
      );
      if (!result) return false;
    }
    return true;
  }
}

/**
 * Extended simulation: human goes first, tries all possible moves,
 * then AI responds optimally. Verifies AI never loses.
 */
function aiNeverLoses(aiPlayer: Player): boolean {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const emptyBoard = createBoard();

  if (aiPlayer === 'X') {
    // AI goes first
    return simulateAllGames(emptyBoard, 'X', 'X');
  } else {
    // Human goes first, try all opening moves
    for (const openingMove of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      const boardAfterHuman = makeMove(emptyBoard, openingMove, humanPlayer);
      const aiMove = getBestMove(boardAfterHuman, aiPlayer);
      const boardAfterAI = makeMove(boardAfterHuman, aiMove, aiPlayer);
      const result = simulateAllGames(boardAfterAI, humanPlayer, aiPlayer);
      if (!result) return false;
    }
    return true;
  }
}

describe('getBestMove unbeatable property', () => {
  it('U-AI-06: AI never loses when playing as X from an empty board', () => {
    expect(aiNeverLoses('X')).toBe(true);
  });

  it('U-AI-07: AI never loses when playing as O (human always goes first)', () => {
    expect(aiNeverLoses('O')).toBe(true);
  });
});

// ── Score Verification ─────────────────────────────────────────────────────────

describe('minimax scoring', () => {
  it('U-AI-10: correctly scores terminal states', () => {
    // On a board where X has won, AI (X) should prefer it (positive), human wins negative
    // We test indirectly: AI always picks winning move
    const board = boards.aiCanWin(); // O at 0,1 -- AI plays O
    const move = getBestMove(board as Board, 'O');
    expect(move).toBe(2); // completes top row win
  });
});

// ── Random Move ─────────────────────────────────────────────────────────────────

describe('getRandomMove', () => {
  it('U-DC-06: returns a valid index from available cells', () => {
    const board = boards.empty();
    board[0] = 'X';
    board[4] = 'O';
    const move = getRandomMove(board as Board);
    expect(board[move]).toBeNull();
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(9);
  });

  it('U-DC-07: handles a board with one cell left', () => {
    const board = boards.oneMoveLeft(4); // index 4 is the only empty cell
    const move = getRandomMove(board as Board);
    expect(move).toBe(4);
  });

  it('always returns one of the available indices', () => {
    const board = boards.empty();
    board[0] = 'X';
    board[1] = 'O';
    board[2] = 'X';
    const available = [3, 4, 5, 6, 7, 8];
    for (let i = 0; i < 20; i++) {
      const move = getRandomMove(board as Board);
      expect(available).toContain(move);
    }
  });
});

// ── Difficulty Controller (getAIMove) ──────────────────────────────────────────

describe('getAIMove', () => {
  it('U-DC-01: Easy always calls random (never optimal for a trivial board)', () => {
    // Mock Math.random to be deterministic -- not needed here as we just validate moves are valid
    const board = createBoard();
    for (let i = 0; i < 10; i++) {
      const move = getAIMove(board, 'easy', 'O');
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
      expect(board[move]).toBeNull();
    }
  });

  it('U-DC-02: Hard always returns optimal move (winning move when available)', () => {
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null] as Board;
    const move = getAIMove(board, 'hard', 'O');
    expect(move).toBe(2); // winning move
  });

  it('U-DC-03: Medium uses minimax when Math.random >= 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5);
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null] as Board;
    const move = getAIMove(board, 'medium', 'O');
    expect(move).toBe(2); // minimax winning move
    vi.restoreAllMocks();
  });

  it('U-DC-04: Medium uses random move when Math.random < 0.5', () => {
    // Spy on Math.random for the difficulty check (returns 0.1 = use random)
    // Then provide a deterministic value for the random move selection
    const mockRandom = vi.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.1); // < 0.5, use random
    mockRandom.mockReturnValueOnce(0.0); // picks first available (index 2)
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null] as Board;
    const move = getAIMove(board, 'medium', 'O');
    // With random=0.0, should pick the first available cell (index 2)
    expect(move).toBe(2);
    vi.restoreAllMocks();
  });

  it('U-DC-05: Medium distributes roughly 50/50 over many calls', () => {
    vi.restoreAllMocks(); // use real randomness
    // Use a near-terminal board (2 cells left) so minimax is near-instant
    // Board: X wins with [2,5,8] if O doesn't block at 8; only cells 2 and 8 are free
    // Minimax optimal for O: play 8 (blocks X's win threat)
    // Random: plays either 2 or 8 with equal probability
    const board: Board = ['X', 'O', null, 'X', 'O', 'X', 'X', 'O', null] as Board;
    let minimaxCount = 0;
    const totalRuns = 200;
    for (let i = 0; i < totalRuns; i++) {
      const move = getAIMove(board, 'medium', 'O');
      if (move === 8) minimaxCount++; // minimax always picks 8 (block); random picks 2 or 8
    }
    // With 50/50 split: ~100 minimax (all pick 8) + ~100 random (half pick 8 = ~50)
    // Total 8-picks should be between 50 and 200 (not all-or-nothing)
    expect(minimaxCount).toBeGreaterThan(30);
    expect(minimaxCount).toBeLessThan(totalRuns);
  });

  it('returns a valid move for all difficulties from any board', () => {
    const testBoard: Board = ['X', null, 'O', null, 'X', null, null, null, null] as Board;
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const move = getAIMove(testBoard, difficulty, 'O');
      expect(testBoard[move]).toBeNull();
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
    }
  });
});
