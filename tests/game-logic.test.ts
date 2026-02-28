/**
 * Unit tests for game-logic.ts
 * Tests: U-GE-01 through U-GE-22
 * All tests operate on pure functions with no DOM dependency.
 */

import { describe, it, expect } from 'vitest';
import {
  createBoard,
  makeMove,
  isValidMove,
  checkWinner,
  getWinningLine,
  checkDraw,
  getAvailableMoves,
  getGameStatus,
  getNextPlayer,
} from '../src/game-logic';
import { boards } from '../src/test-utils/board-factories';
import { WIN_COMBINATIONS } from '../src/test-utils/win-combinations';

// ── Board State Management ─────────────────────────────────────────────────────

describe('createBoard', () => {
  it('U-GE-01: returns an empty 9-cell array of nulls', () => {
    const board = createBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
  });
});

describe('makeMove', () => {
  it('U-GE-02: places a mark at the specified index', () => {
    const board = createBoard();
    const newBoard = makeMove(board, 4, 'X');
    expect(newBoard[4]).toBe('X');
    // All other cells remain null
    for (let i = 0; i < 9; i++) {
      if (i !== 4) expect(newBoard[i]).toBeNull();
    }
  });

  it('U-GE-03: does not mutate the original board (immutability)', () => {
    const board = createBoard();
    const boardCopy = [...board];
    makeMove(board, 0, 'X');
    expect(board).toEqual(boardCopy);
  });

  it('U-GE-04: throws when placing on an occupied cell', () => {
    const board = makeMove(createBoard(), 0, 'X');
    expect(() => makeMove(board, 0, 'O')).toThrow();
  });

  it('U-GE-05: throws on out-of-bounds index (>= 9)', () => {
    expect(() => makeMove(createBoard(), 9, 'X')).toThrow();
  });

  it('U-GE-05: throws on out-of-bounds index (< 0)', () => {
    expect(() => makeMove(createBoard(), -1, 'X')).toThrow();
  });

  it('places O correctly', () => {
    const board = makeMove(createBoard(), 7, 'O');
    expect(board[7]).toBe('O');
  });
});

describe('isValidMove', () => {
  it('returns true for an empty cell', () => {
    expect(isValidMove(createBoard(), 0)).toBe(true);
  });

  it('returns false for an occupied cell', () => {
    const board = makeMove(createBoard(), 0, 'X');
    expect(isValidMove(board, 0)).toBe(false);
  });

  it('returns false for out-of-bounds indices', () => {
    expect(isValidMove(createBoard(), 9)).toBe(false);
    expect(isValidMove(createBoard(), -1)).toBe(false);
  });
});

// ── Win Detection ──────────────────────────────────────────────────────────────

describe('checkWinner', () => {
  it.each(WIN_COMBINATIONS.map((c) => [c.name, c.indices] as const))(
    'U-GE-06..13: detects %s win for X',
    (_name, [a, b, c]) => {
      const board = boards.empty();
      board[a] = 'X';
      board[b] = 'X';
      board[c] = 'X';
      expect(checkWinner(board)).toBe('X');
    },
  );

  it.each(WIN_COMBINATIONS.map((c) => [c.name, c.indices] as const))(
    'U-GE-06..13: detects %s win for O',
    (_name, [a, b, c]) => {
      const board = boards.empty();
      board[a] = 'O';
      board[b] = 'O';
      board[c] = 'O';
      expect(checkWinner(board)).toBe('O');
    },
  );

  it('U-GE-14: returns null for an in-progress game', () => {
    // Partially filled board, no winner
    const board = boards.empty();
    board[0] = 'X';
    board[1] = 'O';
    board[4] = 'X';
    expect(checkWinner(board)).toBeNull();
  });

  it('U-GE-15: returns null on an empty board', () => {
    expect(checkWinner(createBoard())).toBeNull();
  });

  it('detects X win in xWinsTopRow fixture', () => {
    expect(checkWinner(boards.xWinsTopRow())).toBe('X');
  });

  it('detects O win in oWinsLeftCol fixture', () => {
    expect(checkWinner(boards.oWinsLeftCol())).toBe('O');
  });
});

describe('getWinningLine', () => {
  it.each(WIN_COMBINATIONS.map((c) => [c.name, c.indices] as const))(
    'returns correct indices for %s',
    (_name, [a, b, c]) => {
      const board = boards.empty();
      board[a] = 'X';
      board[b] = 'X';
      board[c] = 'X';
      expect(getWinningLine(board)).toEqual([a, b, c]);
    },
  );

  it('returns null when there is no winner', () => {
    expect(getWinningLine(boards.empty())).toBeNull();
  });

  it('returns null on a draw board', () => {
    expect(getWinningLine(boards.draw())).toBeNull();
  });
});

// ── Draw Detection ─────────────────────────────────────────────────────────────

describe('checkDraw', () => {
  it('U-GE-16: returns true when all cells are filled with no winner', () => {
    expect(checkDraw(boards.draw())).toBe(true);
  });

  it('U-GE-17: returns false when cells remain empty', () => {
    const board = boards.empty();
    board[0] = 'X';
    expect(checkDraw(board)).toBe(false);
  });

  it('returns false on an empty board', () => {
    expect(checkDraw(createBoard())).toBe(false);
  });

  it('U-GE-18: win on 9th move is a win, not a draw', () => {
    // Construct a board where the 9th move completes a row
    // X: 0, 1, 2 (top row) -- O fills the rest except index 2
    const board: (string | null)[] = ['X', 'X', null, 'O', 'O', 'X', 'O', 'X', 'O'];
    board[2] = 'X'; // 9th move, top row complete
    expect(checkWinner(board as Parameters<typeof checkWinner>[0])).toBe('X');
    expect(checkDraw(board as Parameters<typeof checkDraw>[0])).toBe(false);
  });
});

// ── Turn Management ────────────────────────────────────────────────────────────

describe('getNextPlayer', () => {
  it('U-GE-19: returns O when current player is X', () => {
    expect(getNextPlayer('X')).toBe('O');
  });

  it('U-GE-20: returns X when current player is O', () => {
    expect(getNextPlayer('O')).toBe('X');
  });
});

describe('getAvailableMoves', () => {
  it('U-GE-21: returns indices of all null cells', () => {
    const board = boards.empty();
    board[0] = 'X';
    board[2] = 'O';
    const available = getAvailableMoves(board);
    expect(available).toEqual([1, 3, 4, 5, 6, 7, 8]);
  });

  it('U-GE-22: returns empty array on a full board', () => {
    expect(getAvailableMoves(boards.draw())).toEqual([]);
  });

  it('returns all 9 indices for an empty board', () => {
    expect(getAvailableMoves(createBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

// ── Game Status ────────────────────────────────────────────────────────────────

describe('getGameStatus', () => {
  it('returns "playing" for an in-progress board', () => {
    const board = boards.empty();
    board[0] = 'X';
    expect(getGameStatus(board)).toBe('playing');
  });

  it('returns "win-x" when X has won', () => {
    expect(getGameStatus(boards.xWinsTopRow())).toBe('win-x');
  });

  it('returns "win-o" when O has won', () => {
    expect(getGameStatus(boards.oWinsLeftCol())).toBe('win-o');
  });

  it('returns "draw" for a drawn board', () => {
    expect(getGameStatus(boards.draw())).toBe('draw');
  });

  it('returns "playing" for an empty board', () => {
    expect(getGameStatus(createBoard())).toBe('playing');
  });
});
