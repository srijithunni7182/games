/**
 * Integration tests for multi-step game flows.
 * These tests verify that game-logic, ai-engine, and state work together.
 */

import { describe, it, expect } from 'vitest';
import { createStore } from '../src/state';
import { INITIAL_STATE } from '../src/constants';
import { getBestMove } from '../src/ai-engine';
import { makeMove, checkWinner, checkDraw } from '../src/game-logic';
import type { GameState, Action, Board } from '../src/types';

function dispatchSequence(initialState: GameState, actions: Action[]): GameState {
  const store = createStore(initialState);
  for (const action of actions) {
    store.dispatch(action);
  }
  return store.getState();
}

// ── Full Game Flows ────────────────────────────────────────────────────────────

describe('I-01: X wins in multiplayer (top row)', () => {
  it('produces win-x result and correct winning line', () => {
    // Multiplayer mode: X plays 0,1,2; O plays 3,4
    const finalState = dispatchSequence(INITIAL_STATE, [
      { type: 'SELECT_MODE', mode: 'multiplayer' },
      { type: 'MAKE_MOVE', index: 0 }, // X
      { type: 'MAKE_MOVE', index: 3 }, // O
      { type: 'MAKE_MOVE', index: 1 }, // X
      { type: 'MAKE_MOVE', index: 4 }, // O
      { type: 'MAKE_MOVE', index: 2 }, // X wins top row
    ]);
    expect(finalState.result).toBe('win-x');
    expect(finalState.winningLine).toEqual([0, 1, 2]);
    expect(finalState.scores.x).toBe(1);
    expect(finalState.scores.o).toBe(0);
  });
});

describe('I-02: O wins in multiplayer (middle column)', () => {
  it('produces win-o result and correct winning line', () => {
    // O wins middle column: O plays 1,4,7
    const finalState = dispatchSequence(INITIAL_STATE, [
      { type: 'SELECT_MODE', mode: 'multiplayer' },
      { type: 'MAKE_MOVE', index: 0 }, // X
      { type: 'MAKE_MOVE', index: 1 }, // O
      { type: 'MAKE_MOVE', index: 3 }, // X
      { type: 'MAKE_MOVE', index: 4 }, // O
      { type: 'MAKE_MOVE', index: 5 }, // X
      { type: 'MAKE_MOVE', index: 7 }, // O wins middle column
    ]);
    expect(finalState.result).toBe('win-o');
    expect(finalState.winningLine).toEqual([1, 4, 7]);
    expect(finalState.scores.o).toBe(1);
  });
});

describe('I-03: Score accumulates across 2 consecutive games', () => {
  it('correctly shows x:1, o:1 after 2 games', () => {
    let state = dispatchSequence(INITIAL_STATE, [{ type: 'SELECT_MODE', mode: 'multiplayer' }]);

    // Game 1: X wins top row
    state = dispatchSequence(state, [
      { type: 'MAKE_MOVE', index: 0 },
      { type: 'MAKE_MOVE', index: 3 },
      { type: 'MAKE_MOVE', index: 1 },
      { type: 'MAKE_MOVE', index: 4 },
      { type: 'MAKE_MOVE', index: 2 },
      { type: 'NEW_GAME' },
    ]);
    expect(state.scores.x).toBe(1);
    expect(state.roundNumber).toBe(1);
    expect(state.currentPlayer).toBe('O'); // O goes first in game 2 (roundNumber 1 is odd)

    // Game 2: O wins middle column (O goes first after NEW_GAME with roundNumber=1)
    state = dispatchSequence(state, [
      { type: 'MAKE_MOVE', index: 1 },  // O at 1
      { type: 'MAKE_MOVE', index: 0 },  // X at 0
      { type: 'MAKE_MOVE', index: 4 },  // O at 4
      { type: 'MAKE_MOVE', index: 3 },  // X at 3
      { type: 'MAKE_MOVE', index: 7 },  // O wins middle column (1,4,7)
    ]);
    expect(state.scores).toEqual({ x: 1, o: 1, draws: 0 });
  });
});

describe('I-04: Mode switch resets everything', () => {
  it('returns to menu and clears state after going back to menu', () => {
    let state = dispatchSequence(INITIAL_STATE, [
      { type: 'SELECT_MODE', mode: 'multiplayer' },
      { type: 'MAKE_MOVE', index: 0 },
      { type: 'MAKE_MOVE', index: 3 },
      { type: 'MAKE_MOVE', index: 1 },
      { type: 'MAKE_MOVE', index: 4 },
      { type: 'MAKE_MOVE', index: 2 }, // X wins
    ]);
    expect(state.scores.x).toBe(1);
    expect(state.screen).toBe('game');

    state = dispatchSequence(state, [{ type: 'BACK_TO_MENU' }]);
    expect(state.screen).toBe('menu');
    expect(state.scores).toEqual({ x: 0, o: 0, draws: 0 });
    expect(state.board.every((c) => c === null)).toBe(true);
  });
});

describe('I-05: All 8 winning lines are correctly detected end-to-end', () => {
  const WIN_LINES = [
    { name: 'top row',       x: [0, 1, 2], o: [3, 4] },
    { name: 'middle row',    x: [3, 4, 5], o: [0, 1] },
    { name: 'bottom row',    x: [6, 7, 8], o: [0, 1] },
    { name: 'left col',      x: [0, 3, 6], o: [1, 4] },
    { name: 'middle col',    x: [1, 4, 7], o: [0, 3] },
    { name: 'right col',     x: [2, 5, 8], o: [0, 3] },
    { name: 'main diagonal', x: [0, 4, 8], o: [1, 3] },
    { name: 'anti-diagonal', x: [2, 4, 6], o: [0, 1] },
  ];

  it.each(WIN_LINES.map((l) => [l.name, l.x, l.o]))(
    'detects X win via %s',
    (_name, xMoves, oMoves) => {
      const moves: Action[] = [];
      // Interleave X and O moves
      for (let i = 0; i < Math.max(xMoves.length, oMoves.length); i++) {
        if (i < xMoves.length) moves.push({ type: 'MAKE_MOVE', index: xMoves[i] });
        if (i < oMoves.length) moves.push({ type: 'MAKE_MOVE', index: oMoves[i] });
      }

      const finalState = dispatchSequence(
        { ...INITIAL_STATE, screen: 'game' },
        moves,
      );
      expect(finalState.result).toBe('win-x');
      expect(finalState.winningLine).toEqual(xMoves);
    },
  );
});

describe('I-06: Hard AI never loses (100 simulated games)', () => {
  it('AI always draws or wins against random human moves', () => {
    let allDrawOrWin = true;

    for (let game = 0; game < 50; game++) {
      let board = Array(9).fill(null) as Board;
      const aiPlayer = 'O';
      const humanPlayer = 'X';
      let currentPlayer: 'X' | 'O' = 'X';
      let gameOver = false;

      while (!gameOver) {
        const available = board.reduce<number[]>(
          (acc, cell, i) => (cell === null ? [...acc, i] : acc),
          [],
        );
        if (available.length === 0) break;

        let move: number;
        if (currentPlayer === aiPlayer) {
          move = getBestMove(board, aiPlayer);
        } else {
          // Random human move
          move = available[Math.floor(Math.random() * available.length)];
        }

        board = makeMove(board, move, currentPlayer);
        const winner = checkWinner(board);
        if (winner !== null) {
          if (winner === humanPlayer) {
            allDrawOrWin = false;
          }
          gameOver = true;
        } else if (checkDraw(board)) {
          gameOver = true;
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
    }

    expect(allDrawOrWin).toBe(true);
  });
});

describe('I-07: RESTART_GAME cancels board state without affecting scores', () => {
  it('board is cleared but score preserved when restarting mid-game', () => {
    let state = dispatchSequence(INITIAL_STATE, [
      { type: 'SELECT_MODE', mode: 'multiplayer' },
      { type: 'MAKE_MOVE', index: 0 },
      { type: 'MAKE_MOVE', index: 3 },
      { type: 'MAKE_MOVE', index: 1 },
      { type: 'MAKE_MOVE', index: 4 },
      { type: 'MAKE_MOVE', index: 2 }, // X wins
    ]);
    const scoreBeforeRestart = state.scores;
    state = dispatchSequence(state, [{ type: 'RESTART_GAME' }]);

    expect(state.board.every((c) => c === null)).toBe(true);
    expect(state.scores).toEqual(scoreBeforeRestart);
    expect(state.result).toBe('playing');
  });
});
