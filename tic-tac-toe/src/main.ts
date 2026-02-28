/**
 * main.ts — App entry point.
 * Creates the store, wires up the renderer, and handles AI scheduling.
 */

import './styles/main.css';

import { createStore } from './state';
import { getAIMove } from './ai-engine';
import { createRenderer } from './renderer';
import { AI_DELAY_MIN, AI_DELAY_MAX } from './constants';

// ── Bootstrap ──────────────────────────────────────────────────────────────────

const store = createStore();
const appEl = document.getElementById('app');
if (!appEl) throw new Error('#app element not found');

const renderer = createRenderer(appEl, store.dispatch);

// ── AI scheduling (managed outside the store to avoid reentrant dispatch) ──────

let aiTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAIMove(): void {
  if (aiTimer !== null) return; // Already scheduled
  const delay = AI_DELAY_MIN + Math.random() * (AI_DELAY_MAX - AI_DELAY_MIN);
  aiTimer = setTimeout(() => {
    aiTimer = null;
    const s = store.getState();
    if (s.isAITurn && s.result === 'playing') {
      const aiPlayer = s.humanSymbol === 'X' ? 'O' : 'X';
      const move = getAIMove(s.board, s.difficulty, aiPlayer);
      store.dispatch({ type: 'AI_MOVE', index: move });
    }
  }, delay);
}

function cancelAIMove(): void {
  if (aiTimer !== null) {
    clearTimeout(aiTimer);
    aiTimer = null;
  }
}

// ── State subscription ─────────────────────────────────────────────────────────

store.subscribe((state) => {
  renderer.render(state);

  if (state.isAITurn && state.result === 'playing') {
    scheduleAIMove();
  } else {
    cancelAIMove();
  }
});

// ── Initial render ─────────────────────────────────────────────────────────────

renderer.render(store.getState());
