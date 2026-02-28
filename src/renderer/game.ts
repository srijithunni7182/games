/**
 * game.ts — Renders and patches the game screen (board, status, scores, buttons).
 */

import type { GameState, Dispatch } from '../types';
import { STRINGS } from '../strings';
import { announce } from './dom-helpers';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusText(state: GameState): string {
  const { result, mode, currentPlayer, isAITurn } = state;

  if (result === 'win-x') return STRINGS.RESULT_X_WINS;
  if (result === 'win-o') return STRINGS.RESULT_O_WINS;
  if (result === 'draw') return STRINGS.RESULT_DRAW;

  if (mode === 'ai') {
    if (isAITurn) return STRINGS.AI_THINKING;
    return currentPlayer === 'X' ? STRINGS.TURN_X : STRINGS.TURN_O;
  }

  // Multiplayer
  return currentPlayer === 'X' ? STRINGS.TURN_PLAYER_X : STRINGS.TURN_PLAYER_O;
}

function getScoreLabels(state: GameState): { x: string; o: string } {
  if (state.mode === 'ai') {
    const humanIsX = state.humanSymbol === 'X';
    return {
      x: STRINGS.SCORE_X_AI_MODE(humanIsX),
      o: STRINGS.SCORE_O_AI_MODE(humanIsX),
    };
  }
  return { x: STRINGS.SCORE_PLAYER_X, o: STRINGS.SCORE_PLAYER_O };
}

function isBoardLocked(state: GameState): boolean {
  return state.result !== 'playing' || state.isAITurn;
}

function buildCellHTML(index: number, value: string | null, isWinning: boolean, locked: boolean): string {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const ariaLabel = value
    ? STRINGS.A11Y_CELL_OCCUPIED(row, col, value)
    : STRINGS.A11Y_CELL_EMPTY(row, col);
  const markAttr = value ? `data-mark="${value}"` : '';
  const winningClass = isWinning ? ' cell--winning' : '';
  const emptyClass = !value && !locked ? ' cell--interactive' : '';

  return `
    <button
      class="cell${winningClass}${emptyClass}"
      data-cell-index="${index}"
      ${markAttr}
      type="button"
      aria-label="${ariaLabel}"
      ${value || locked ? 'disabled' : ''}
    >${value ?? ''}</button>
  `;
}

function buildActionButtons(state: GameState): string {
  const isOver = state.result !== 'playing';
  return `
    ${
      isOver
        ? `<button class="btn btn-primary" id="btn-play-again" type="button">${STRINGS.BTN_PLAY_AGAIN}</button>`
        : `<button class="btn btn-secondary" id="btn-restart" type="button">${STRINGS.BTN_RESTART}</button>`
    }
    <button class="btn btn-ghost" id="btn-menu" type="button">${STRINGS.BTN_MENU}</button>
  `;
}

// ── Initial render ─────────────────────────────────────────────────────────────

export function renderGame(container: HTMLElement, state: GameState, dispatch: Dispatch): void {
  const { x, o, draws } = state.scores;
  const labels = getScoreLabels(state);
  const locked = isBoardLocked(state);
  const statusText = getStatusText(state);

  container.innerHTML = `
    <div class="screen game-screen" role="region" aria-label="Tic Tac Toe game">

      <div class="score-bar" aria-label="${STRINGS.A11Y_SCORE(x, draws, o)}">
        <div class="score-item score-item--x">
          <span class="score-label">${labels.x}</span>
          <span class="score-value" id="score-x">${x}</span>
        </div>
        <div class="score-item score-item--draw">
          <span class="score-label">${STRINGS.SCORE_DRAW}</span>
          <span class="score-value" id="score-draws">${draws}</span>
        </div>
        <div class="score-item score-item--o">
          <span class="score-label">${labels.o}</span>
          <span class="score-value" id="score-o">${o}</span>
        </div>
      </div>

      <p
        class="game-status${state.result !== 'playing' ? ' game-status--result' : ''}"
        id="game-status"
        aria-live="polite"
      >${statusText}</p>

      <div
        class="board${locked ? ' board--locked' : ''}"
        id="board"
        role="grid"
        aria-label="${STRINGS.A11Y_BOARD}"
      >
        ${state.board
          .map((cell, i) =>
            buildCellHTML(i, cell, state.winningLine?.includes(i) ?? false, locked),
          )
          .join('')}
      </div>

      <div class="action-buttons" id="action-buttons">
        ${buildActionButtons(state)}
      </div>

    </div>
  `;

  attachGameListeners(container, dispatch);
}

// ── Patch update (same screen) ─────────────────────────────────────────────────

export function updateGame(container: HTMLElement, state: GameState, dispatch: Dispatch): void {
  const { x, o, draws } = state.scores;
  const locked = isBoardLocked(state);
  const statusText = getStatusText(state);

  // Scores
  const scoreX = container.querySelector('#score-x');
  const scoreO = container.querySelector('#score-o');
  const scoreD = container.querySelector('#score-draws');
  if (scoreX) scoreX.textContent = String(x);
  if (scoreO) scoreO.textContent = String(o);
  if (scoreD) scoreD.textContent = String(draws);

  // Status
  const statusEl = container.querySelector<HTMLElement>('#game-status');
  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.classList.toggle('game-status--result', state.result !== 'playing');
  }

  // Board lock class
  const board = container.querySelector<HTMLElement>('#board');
  if (board) {
    board.classList.toggle('board--locked', locked);

    // Update each cell
    state.board.forEach((cell, i) => {
      const cellEl = board.querySelector<HTMLButtonElement>(`[data-cell-index="${i}"]`);
      if (!cellEl) return;

      const isWinning = state.winningLine?.includes(i) ?? false;
      cellEl.textContent = cell ?? '';
      cellEl.setAttribute('data-mark', cell ?? '');
      if (!cell) cellEl.removeAttribute('data-mark');

      cellEl.disabled = !!cell || locked;
      cellEl.classList.toggle('cell--winning', isWinning);
      cellEl.classList.toggle('cell--interactive', !cell && !locked);

      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      cellEl.setAttribute(
        'aria-label',
        cell
          ? STRINGS.A11Y_CELL_OCCUPIED(row, col, cell)
          : STRINGS.A11Y_CELL_EMPTY(row, col),
      );
    });
  }

  // Action buttons — only rebuild if game-over state changed
  const actionsEl = container.querySelector<HTMLElement>('#action-buttons');
  const hasPlayAgain = !!container.querySelector('#btn-play-again');
  const isOver = state.result !== 'playing';

  if (actionsEl && hasPlayAgain !== isOver) {
    actionsEl.innerHTML = buildActionButtons(state);
    attachActionListeners(container, dispatch);
  }

  // Announce result to screen readers
  if (state.result !== 'playing') {
    const msg = STRINGS.A11Y_GAME_RESULT(statusText);
    announce(msg);
  }
}

// ── Event wiring ───────────────────────────────────────────────────────────────

function attachGameListeners(container: HTMLElement, dispatch: Dispatch): void {
  // Board — event delegation
  const board = container.querySelector<HTMLElement>('#board');
  board?.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-cell-index]');
    if (!cell) return;
    const index = parseInt(cell.dataset.cellIndex!, 10);
    if (!isNaN(index)) {
      dispatch({ type: 'MAKE_MOVE', index });
    }
  });

  attachActionListeners(container, dispatch);
}

function attachActionListeners(container: HTMLElement, dispatch: Dispatch): void {
  container.querySelector('#btn-play-again')?.addEventListener('click', () => {
    dispatch({ type: 'NEW_GAME' });
  });
  container.querySelector('#btn-restart')?.addEventListener('click', () => {
    dispatch({ type: 'RESTART_GAME' });
  });
  container.querySelector('#btn-menu')?.addEventListener('click', () => {
    dispatch({ type: 'BACK_TO_MENU' });
  });
}
