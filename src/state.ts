/**
 * state.ts - Centralized store with pub/sub, and the pure reducer function.
 * The reducer handles all state transitions. The store wraps it with subscribe/dispatch.
 */

import type { GameState, Action, Store, Subscriber } from './types';
import { INITIAL_STATE } from './constants';
import { makeMove, checkWinner, getWinningLine, checkDraw, getNextPlayer } from './game-logic';

// ── Reducer ────────────────────────────────────────────────────────────────────

/**
 * Pure reducer: (state, action) => newState.
 * Never mutates state. Always returns a new object.
 */
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_MODE': {
      return {
        ...state,
        mode: action.mode,
        // AI mode goes to setup for difficulty selection; multiplayer goes straight to game
        screen: action.mode === 'ai' ? 'setup' : 'game',
        // Reset board when entering game directly from mode selection
        board: INITIAL_STATE.board,
        currentPlayer: 'X',
        result: 'playing',
        winningLine: null,
        isAITurn: false,
        aiTimerID: null,
      };
    }

    case 'SELECT_DIFFICULTY': {
      return {
        ...state,
        difficulty: action.difficulty,
      };
    }

    case 'SELECT_SYMBOL': {
      return {
        ...state,
        humanSymbol: action.symbol,
      };
    }

    case 'START_GAME': {
      // X always goes first in standard Tic Tac Toe rules
      const firstPlayer = 'X' as const;
      return {
        ...state,
        screen: 'game',
        board: INITIAL_STATE.board,
        currentPlayer: firstPlayer,
        result: 'playing',
        winningLine: null,
        isAITurn: state.mode === 'ai' && state.humanSymbol === 'O',
        aiTimerID: null,
      };
    }

    case 'MAKE_MOVE': {
      // Guard: ignore if game is over or cell is occupied
      if (state.result !== 'playing') return state;
      if (state.board[action.index] !== null) return state;
      if (action.index < 0 || action.index >= 9) return state;

      const newBoard = makeMove(state.board, action.index, state.currentPlayer);
      const winner = checkWinner(newBoard);
      const winLine = getWinningLine(newBoard);
      const isDraw = !winner && checkDraw(newBoard);

      let result: import('./types').GameResult = state.result;
      let newScores = { ...state.scores };

      if (winner === 'X') {
        result = 'win-x';
        newScores = { ...newScores, x: newScores.x + 1 };
      } else if (winner === 'O') {
        result = 'win-o';
        newScores = { ...newScores, o: newScores.o + 1 };
      } else if (isDraw) {
        result = 'draw';
        newScores = { ...newScores, draws: newScores.draws + 1 };
      }

      const isGameOver = result !== 'playing';
      const nextPlayer = getNextPlayer(state.currentPlayer);
      const aiSymbol = state.humanSymbol === 'X' ? 'O' : 'X';
      const nextIsAITurn =
        !isGameOver && state.mode === 'ai' && nextPlayer === aiSymbol;

      return {
        ...state,
        board: newBoard,
        currentPlayer: nextPlayer,
        result,
        winningLine: winLine,
        scores: newScores,
        isAITurn: nextIsAITurn,
      };
    }

    case 'AI_MOVE': {
      // Guard: ignore if game is over
      if (state.result !== 'playing') return state;

      const newBoard = makeMove(state.board, action.index, state.currentPlayer);
      const winner = checkWinner(newBoard);
      const winLine = getWinningLine(newBoard);
      const isDraw = !winner && checkDraw(newBoard);

      let result: import('./types').GameResult = state.result;
      let newScores = { ...state.scores };

      if (winner === 'X') {
        result = 'win-x';
        newScores = { ...newScores, x: newScores.x + 1 };
      } else if (winner === 'O') {
        result = 'win-o';
        newScores = { ...newScores, o: newScores.o + 1 };
      } else if (isDraw) {
        result = 'draw';
        newScores = { ...newScores, draws: newScores.draws + 1 };
      }

      return {
        ...state,
        board: newBoard,
        currentPlayer: getNextPlayer(state.currentPlayer),
        result,
        winningLine: winLine,
        scores: newScores,
        isAITurn: false,
        aiTimerID: null,
      };
    }

    case 'SET_AI_TIMER': {
      return {
        ...state,
        aiTimerID: action.timerID,
      };
    }

    case 'NEW_GAME': {
      // Cancel any pending AI timer (caller handles clearTimeout before dispatching)
      const aiSymbol = state.humanSymbol === 'X' ? 'O' : 'X';
      const newRoundNumber = state.roundNumber + 1;

      // In multiplayer, alternate who goes first based on round number
      let firstPlayer: import('./types').Player = 'X';
      if (state.mode === 'multiplayer') {
        firstPlayer = newRoundNumber % 2 === 0 ? 'X' : 'O';
      }

      const aiGoesFirst = state.mode === 'ai' && aiSymbol === firstPlayer;

      return {
        ...state,
        board: INITIAL_STATE.board,
        currentPlayer: firstPlayer,
        result: 'playing',
        winningLine: null,
        isAITurn: aiGoesFirst,
        aiTimerID: null,
        roundNumber: newRoundNumber,
        // Scores preserved intentionally
      };
    }

    case 'RESTART_GAME': {
      // Same as NEW_GAME but does NOT update scores and does NOT increment roundNumber
      const aiSymbol = state.humanSymbol === 'X' ? 'O' : 'X';
      const humanGoesFirst = aiSymbol !== 'X';

      return {
        ...state,
        board: INITIAL_STATE.board,
        currentPlayer: 'X',
        result: 'playing',
        winningLine: null,
        isAITurn: state.mode === 'ai' && !humanGoesFirst && aiSymbol === 'X',
        aiTimerID: null,
        // scores and roundNumber NOT changed
      };
    }

    case 'BACK_TO_MENU': {
      return {
        ...INITIAL_STATE,
        // Scores reset to zero (fresh session)
      };
    }

    default: {
      // TypeScript exhaustive check -- should never reach here
      return state;
    }
  }
}

// ── Store Factory ──────────────────────────────────────────────────────────────

/**
 * Creates a minimal pub/sub store wrapping the reducer.
 * Subscribers are notified synchronously after each dispatch.
 */
export function createStore(initialState: GameState = INITIAL_STATE): Store {
  let state = initialState;
  const subscribers = new Set<Subscriber>();

  return {
    getState: () => state,

    dispatch: (action: Action) => {
      state = reducer(state, action);
      subscribers.forEach((fn) => fn(state));
    },

    subscribe: (fn: Subscriber) => {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
  };
}
