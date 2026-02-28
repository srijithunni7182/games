/**
 * Unit tests for state.ts
 * Tests: reducer actions, store pub/sub, score tracking.
 */

import { describe, it, expect, vi } from 'vitest';
import { createStore, reducer } from '../src/state';
import { INITIAL_STATE } from '../src/constants';
import type { GameState, Action } from '../src/types';

// ── Reducer Tests ──────────────────────────────────────────────────────────────

describe('reducer: SELECT_MODE', () => {
  it('transitions to setup screen for AI mode', () => {
    const action: Action = { type: 'SELECT_MODE', mode: 'ai' };
    const newState = reducer(INITIAL_STATE, action);
    expect(newState.mode).toBe('ai');
    expect(newState.screen).toBe('setup');
  });

  it('transitions to game screen for multiplayer mode', () => {
    const action: Action = { type: 'SELECT_MODE', mode: 'multiplayer' };
    const newState = reducer(INITIAL_STATE, action);
    expect(newState.mode).toBe('multiplayer');
    expect(newState.screen).toBe('game');
  });
});

describe('reducer: SELECT_DIFFICULTY', () => {
  it('sets the difficulty level', () => {
    const state: GameState = { ...INITIAL_STATE, screen: 'setup' };
    const newState = reducer(state, { type: 'SELECT_DIFFICULTY', difficulty: 'hard' });
    expect(newState.difficulty).toBe('hard');
  });

  it('sets easy difficulty', () => {
    const newState = reducer(INITIAL_STATE, { type: 'SELECT_DIFFICULTY', difficulty: 'easy' });
    expect(newState.difficulty).toBe('easy');
  });
});

describe('reducer: SELECT_SYMBOL', () => {
  it('sets humanSymbol to O', () => {
    const newState = reducer(INITIAL_STATE, { type: 'SELECT_SYMBOL', symbol: 'O' });
    expect(newState.humanSymbol).toBe('O');
  });

  it('sets humanSymbol to X', () => {
    const state: GameState = { ...INITIAL_STATE, humanSymbol: 'O' };
    const newState = reducer(state, { type: 'SELECT_SYMBOL', symbol: 'X' });
    expect(newState.humanSymbol).toBe('X');
  });
});

describe('reducer: START_GAME', () => {
  it('transitions to game screen', () => {
    const state: GameState = { ...INITIAL_STATE, screen: 'setup' };
    const newState = reducer(state, { type: 'START_GAME' });
    expect(newState.screen).toBe('game');
  });

  it('resets board to all nulls', () => {
    const state: GameState = { ...INITIAL_STATE, screen: 'setup' };
    const newState = reducer(state, { type: 'START_GAME' });
    expect(newState.board.every((c) => c === null)).toBe(true);
    expect(newState.board).toHaveLength(9);
  });

  it('sets result to playing', () => {
    const state: GameState = { ...INITIAL_STATE, screen: 'setup' };
    const newState = reducer(state, { type: 'START_GAME' });
    expect(newState.result).toBe('playing');
  });
});

describe('reducer: MAKE_MOVE', () => {
  it('places the current player mark on the board', () => {
    const gameState: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      currentPlayer: 'X',
    };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 4 });
    expect(newState.board[4]).toBe('X');
  });

  it('toggles current player from X to O', () => {
    const gameState: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      currentPlayer: 'X',
    };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 0 });
    expect(newState.currentPlayer).toBe('O');
  });

  it('toggles current player from O to X', () => {
    const gameState: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      currentPlayer: 'O',
    };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 0 });
    expect(newState.currentPlayer).toBe('X');
  });

  it('detects X win and updates result to win-x', () => {
    // Set up board where X wins on next move
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'];
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 2 });
    expect(newState.result).toBe('win-x');
    expect(newState.winningLine).toEqual([0, 1, 2]);
  });

  it('detects O win and updates result to win-o', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null] as GameState['board'];
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'O' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 2 });
    expect(newState.result).toBe('win-o');
  });

  it('detects draw', () => {
    // Board with one cell left and no winner possible
    // X O X / X O O / O X _  -- placing X at index 8 results in draw
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null] as GameState['board'];
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 8 });
    expect(newState.result).toBe('draw');
  });

  it('sets winningLine to null when still playing', () => {
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', currentPlayer: 'X' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 4 });
    expect(newState.winningLine).toBeNull();
    expect(newState.result).toBe('playing');
  });

  it('updates scores when X wins', () => {
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'];
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 2 });
    expect(newState.scores.x).toBe(1);
    expect(newState.scores.o).toBe(0);
    expect(newState.scores.draws).toBe(0);
  });

  it('updates scores when there is a draw', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null] as GameState['board'];
    const gameState: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(gameState, { type: 'MAKE_MOVE', index: 8 });
    expect(newState.scores.draws).toBe(1);
  });
});

describe('reducer: AI_MOVE', () => {
  it('places the AI mark and unsets isAITurn', () => {
    const gameState: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      currentPlayer: 'O',
      isAITurn: true,
    };
    const newState = reducer(gameState, { type: 'AI_MOVE', index: 4 });
    expect(newState.board[4]).toBe('O');
    expect(newState.isAITurn).toBe(false);
  });
});

describe('reducer: SET_AI_TIMER', () => {
  it('stores the timer ID', () => {
    const newState = reducer(INITIAL_STATE, { type: 'SET_AI_TIMER', timerID: 42 });
    expect(newState.aiTimerID).toBe(42);
  });
});

describe('reducer: NEW_GAME', () => {
  it('resets the board but preserves scores', () => {
    const stateWithScores: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      scores: { x: 3, o: 1, draws: 2 },
      board: ['X', 'O', 'X', 'O', 'X', null, null, null, null] as GameState['board'],
    };
    const newState = reducer(stateWithScores, { type: 'NEW_GAME' });
    expect(newState.board.every((c) => c === null)).toBe(true);
    expect(newState.scores).toEqual({ x: 3, o: 1, draws: 2 });
    expect(newState.result).toBe('playing');
  });

  it('increments roundNumber', () => {
    const state: GameState = { ...INITIAL_STATE, roundNumber: 2, screen: 'game' };
    const newState = reducer(state, { type: 'NEW_GAME' });
    expect(newState.roundNumber).toBe(3);
  });

  it('clears winningLine', () => {
    const state: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      winningLine: [0, 1, 2],
    };
    const newState = reducer(state, { type: 'NEW_GAME' });
    expect(newState.winningLine).toBeNull();
  });
});

describe('reducer: RESTART_GAME', () => {
  it('resets the board without changing scores', () => {
    const stateWithScores: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      scores: { x: 2, o: 0, draws: 1 },
      board: ['X', 'O', null, null, null, null, null, null, null] as GameState['board'],
    };
    const newState = reducer(stateWithScores, { type: 'RESTART_GAME' });
    expect(newState.board.every((c) => c === null)).toBe(true);
    expect(newState.scores).toEqual({ x: 2, o: 0, draws: 1 });
  });

  it('does NOT increment roundNumber (unlike NEW_GAME)', () => {
    const state: GameState = { ...INITIAL_STATE, roundNumber: 5, screen: 'game' };
    const newState = reducer(state, { type: 'RESTART_GAME' });
    expect(newState.roundNumber).toBe(5);
  });
});

describe('reducer: BACK_TO_MENU', () => {
  it('resets to menu screen', () => {
    const state: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      scores: { x: 3, o: 1, draws: 1 },
    };
    const newState = reducer(state, { type: 'BACK_TO_MENU' });
    expect(newState.screen).toBe('menu');
  });

  it('resets scores to zero', () => {
    const state: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      scores: { x: 3, o: 1, draws: 1 },
    };
    const newState = reducer(state, { type: 'BACK_TO_MENU' });
    expect(newState.scores).toEqual({ x: 0, o: 0, draws: 0 });
  });

  it('clears the board', () => {
    const state: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      board: ['X', 'O', null, null, null, null, null, null, null] as GameState['board'],
    };
    const newState = reducer(state, { type: 'BACK_TO_MENU' });
    expect(newState.board.every((c) => c === null)).toBe(true);
  });
});

// ── Store Tests ────────────────────────────────────────────────────────────────

describe('createStore', () => {
  it('returns the initial state via getState', () => {
    const store = createStore(INITIAL_STATE);
    expect(store.getState()).toEqual(INITIAL_STATE);
  });

  it('notifies subscribers on dispatch', () => {
    const store = createStore(INITIAL_STATE);
    const subscriber = vi.fn();
    store.subscribe(subscriber);
    store.dispatch({ type: 'SELECT_MODE', mode: 'multiplayer' });
    expect(subscriber).toHaveBeenCalledOnce();
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'multiplayer', screen: 'game' }),
    );
  });

  it('allows unsubscribing', () => {
    const store = createStore(INITIAL_STATE);
    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);
    unsubscribe();
    store.dispatch({ type: 'SELECT_MODE', mode: 'multiplayer' });
    expect(subscriber).not.toHaveBeenCalled();
  });

  it('supports multiple subscribers', () => {
    const store = createStore(INITIAL_STATE);
    const sub1 = vi.fn();
    const sub2 = vi.fn();
    store.subscribe(sub1);
    store.subscribe(sub2);
    store.dispatch({ type: 'SELECT_MODE', mode: 'multiplayer' });
    expect(sub1).toHaveBeenCalledOnce();
    expect(sub2).toHaveBeenCalledOnce();
  });

  it('updates state after dispatch', () => {
    const store = createStore(INITIAL_STATE);
    store.dispatch({ type: 'SELECT_MODE', mode: 'multiplayer' });
    expect(store.getState().mode).toBe('multiplayer');
    expect(store.getState().screen).toBe('game');
  });
});

// ── Score Tracker Tests ────────────────────────────────────────────────────────

describe('score tracking via reducer', () => {
  it('U-ST-01: initial scores are all zero', () => {
    expect(INITIAL_STATE.scores).toEqual({ x: 0, o: 0, draws: 0 });
  });

  it('U-ST-02: X win increments X score', () => {
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'];
    const state: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    expect(newState.scores).toEqual({ x: 1, o: 0, draws: 0 });
  });

  it('U-ST-03: O win increments O score', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null] as GameState['board'];
    const state: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'O' };
    const newState = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    expect(newState.scores).toEqual({ x: 0, o: 1, draws: 0 });
  });

  it('U-ST-04: draw increments draws', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null] as GameState['board'];
    const state: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    const newState = reducer(state, { type: 'MAKE_MOVE', index: 8 });
    expect(newState.scores).toEqual({ x: 0, o: 0, draws: 1 });
  });

  it('U-ST-05: multiple recordings accumulate correctly', () => {
    // X wins
    let board = ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'];
    let state: GameState = { ...INITIAL_STATE, screen: 'game', board, currentPlayer: 'X' };
    state = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    // NEW_GAME preserves scores
    state = reducer(state, { type: 'NEW_GAME' });

    // O wins
    board = ['O', 'O', null, 'X', 'X', null, null, null, null] as GameState['board'];
    state = { ...state, board, currentPlayer: 'O' };
    state = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    state = reducer(state, { type: 'NEW_GAME' });

    // Draw
    board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null] as GameState['board'];
    state = { ...state, board, currentPlayer: 'X' };
    state = reducer(state, { type: 'MAKE_MOVE', index: 8 });

    expect(state.scores).toEqual({ x: 1, o: 1, draws: 1 });
  });

  it('U-ST-06: BACK_TO_MENU resets scores to zero', () => {
    const state: GameState = {
      ...INITIAL_STATE,
      screen: 'game',
      scores: { x: 5, o: 3, draws: 2 },
    };
    const newState = reducer(state, { type: 'BACK_TO_MENU' });
    expect(newState.scores).toEqual({ x: 0, o: 0, draws: 0 });
  });

  it('U-ST-07: handles large score counts without overflow', () => {
    let state: GameState = { ...INITIAL_STATE, scores: { x: 98, o: 0, draws: 0 } };
    // Win one more X game
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'];
    state = { ...state, screen: 'game', board, currentPlayer: 'X' };
    state = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    expect(state.scores.x).toBe(99);
    // And 100
    state = reducer(state, { type: 'NEW_GAME' });
    state = { ...state, board: ['X', 'X', null, 'O', 'O', null, null, null, null] as GameState['board'], currentPlayer: 'X' };
    state = reducer(state, { type: 'MAKE_MOVE', index: 2 });
    expect(state.scores.x).toBe(100);
  });
});
