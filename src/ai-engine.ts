/**
 * ai-engine.ts - Minimax AI with difficulty levels.
 * Pure functions. No side effects. No DOM access.
 */

import type { Board, Player, Difficulty } from './types';
import { checkWinner, checkDraw, getAvailableMoves, getNextPlayer } from './game-logic';
import { MEDIUM_MINIMAX_PROBABILITY } from './constants';

/**
 * Minimax algorithm with depth penalty.
 * Returns a score from the AI player's perspective:
 *   +10 - depth: AI wins (prefer faster wins)
 *   -10 + depth: Human wins (prefer slower losses, giving opponent more chances to err)
 *   0: Draw
 *
 * @param board   Current board state
 * @param depth   Recursion depth (used for depth penalty scoring)
 * @param isMaximizing  True when it's the AI's turn (maximizing player)
 * @param aiPlayer  The AI's symbol ('X' or 'O')
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
): number {
  const winner = checkWinner(board);
  const humanPlayer = getNextPlayer(aiPlayer);

  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return -10 + depth;
  if (checkDraw(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const newBoard = board.slice() as Board;
      (newBoard as import('./types').CellValue[])[move] = aiPlayer;
      const score = minimax(Object.freeze(newBoard), depth + 1, false, aiPlayer);
      if (score > best) best = score;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const newBoard = board.slice() as Board;
      (newBoard as import('./types').CellValue[])[move] = humanPlayer;
      const score = minimax(Object.freeze(newBoard), depth + 1, true, aiPlayer);
      if (score < best) best = score;
    }
    return best;
  }
}

/**
 * Returns the index of the best move for aiPlayer using full Minimax.
 * Pure function -- no side effects.
 */
export function getBestMove(board: Board, aiPlayer: Player): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  const humanPlayer = getNextPlayer(aiPlayer);

  for (const move of getAvailableMoves(board)) {
    const newBoard = board.slice() as Board;
    (newBoard as import('./types').CellValue[])[move] = aiPlayer;
    const score = minimax(Object.freeze(newBoard), 0, false, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // Silence unused variable warning -- humanPlayer used implicitly through minimax
  void humanPlayer;
  return bestMove;
}

/**
 * Returns a random valid move index.
 * Uses Math.random() -- technically impure, but acceptable for game AI.
 */
export function getRandomMove(board: Board): number {
  const moves = getAvailableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Returns the AI's chosen move based on the difficulty level.
 *
 * Easy:   Always random.
 * Medium: MEDIUM_MINIMAX_PROBABILITY chance of optimal, otherwise random (per move).
 * Hard:   Always optimal (full Minimax).
 */
export function getAIMove(board: Board, difficulty: Difficulty, aiPlayer: Player): number {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board);
    case 'medium':
      return Math.random() >= MEDIUM_MINIMAX_PROBABILITY
        ? getBestMove(board, aiPlayer)
        : getRandomMove(board);
    case 'hard':
      return getBestMove(board, aiPlayer);
  }
}
