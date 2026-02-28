/**
 * game-logic.ts - Pure functions for all Tic Tac Toe game rules.
 * Zero side effects. No DOM access. Fully testable in isolation.
 */

import type { Board, CellValue, Player, GameResult } from './types';
import { WIN_LINES } from './constants';

/**
 * Creates and returns a new empty 9-cell board (all null).
 */
export function createBoard(): Board {
  return Object.freeze(Array(9).fill(null)) as Board;
}

/**
 * Returns a new board with the player's mark placed at the given index.
 * Throws if the index is out of bounds or the cell is already occupied.
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (index < 0 || index >= 9) {
    throw new RangeError(`Index ${index} is out of bounds. Must be 0-8.`);
  }
  if (board[index] !== null) {
    throw new Error(`Cell ${index} is already occupied by ${board[index]}.`);
  }
  const newBoard = [...board] as CellValue[];
  newBoard[index] = player;
  return Object.freeze(newBoard) as Board;
}

/**
 * Returns true if a move at the given index is valid (in bounds and empty).
 */
export function isValidMove(board: Board, index: number): boolean {
  if (index < 0 || index >= 9) return false;
  return board[index] === null;
}

/**
 * Checks for a winner on the current board.
 * Returns the winning Player ('X' or 'O') or null if no winner.
 */
export function checkWinner(board: Board): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    const cell = board[a];
    if (cell !== null && cell === board[b] && cell === board[c]) {
      return cell as Player;
    }
  }
  return null;
}

/**
 * Returns the indices of the winning line (e.g. [0, 1, 2] for top row),
 * or null if no winner.
 */
export function getWinningLine(board: Board): readonly [number, number, number] | null {
  for (const [a, b, c] of WIN_LINES) {
    const cell = board[a];
    if (cell !== null && cell === board[b] && cell === board[c]) {
      return [a, b, c];
    }
  }
  return null;
}

/**
 * Returns true if the board is full and there is no winner (draw).
 * Win detection takes priority: checkWinner should be called first.
 */
export function checkDraw(board: Board): boolean {
  if (checkWinner(board) !== null) return false;
  return board.every((cell) => cell !== null);
}

/**
 * Returns an array of indices where the board is empty (valid moves).
 */
export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
}

/**
 * Returns the next player given the current player.
 */
export function getNextPlayer(currentPlayer: Player): Player {
  return currentPlayer === 'X' ? 'O' : 'X';
}

/**
 * Returns the comprehensive game status based on the current board state.
 */
export function getGameStatus(board: Board): GameResult {
  const winner = checkWinner(board);
  if (winner === 'X') return 'win-x';
  if (winner === 'O') return 'win-o';
  if (checkDraw(board)) return 'draw';
  return 'playing';
}
