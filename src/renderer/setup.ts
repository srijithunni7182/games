/**
 * setup.ts — Renders and updates the AI difficulty / symbol selection screen.
 */

import type { GameState, Dispatch, Difficulty, Player } from '../types';
import { STRINGS } from '../strings';

export function renderSetup(container: HTMLElement, state: GameState, dispatch: Dispatch): void {
  container.innerHTML = `
    <div class="screen setup-screen" role="region" aria-label="Game setup">
      <div class="setup-content">
        <button class="back-btn" id="back-btn" type="button" aria-label="Back to menu">
          ← ${STRINGS.BTN_BACK}
        </button>

        <h2 class="setup-heading">${STRINGS.SETUP_HEADING}</h2>

        <div class="difficulty-cards" role="radiogroup" aria-label="Difficulty">
          ${(['easy', 'medium', 'hard'] as Difficulty[])
            .map(
              (d) => `
            <button
              class="difficulty-card${state.difficulty === d ? ' active' : ''}"
              data-difficulty="${d}"
              type="button"
              role="radio"
              aria-checked="${state.difficulty === d}"
            >
              <span class="diff-label">${STRINGS[`DIFFICULTY_${d.toUpperCase()}` as keyof typeof STRINGS] as string}</span>
              <span class="diff-desc">${STRINGS[`DIFFICULTY_${d.toUpperCase()}_DESC` as keyof typeof STRINGS] as string}</span>
            </button>
          `,
            )
            .join('')}
        </div>

        <div class="symbol-selector" role="group" aria-label="${STRINGS.SETUP_PLAY_AS}">
          <span class="symbol-label">${STRINGS.SETUP_PLAY_AS}</span>
          <div class="symbol-buttons">
            <button
              class="symbol-btn${state.humanSymbol === 'X' ? ' active' : ''}"
              data-symbol="X"
              type="button"
              role="radio"
              aria-checked="${state.humanSymbol === 'X'}"
            >X</button>
            <button
              class="symbol-btn${state.humanSymbol === 'O' ? ' active' : ''}"
              data-symbol="O"
              type="button"
              role="radio"
              aria-checked="${state.humanSymbol === 'O'}"
            >O</button>
          </div>
        </div>

        <button class="play-btn" id="play-btn" type="button">
          Play!
        </button>
      </div>
    </div>
  `;

  container.querySelector('#back-btn')?.addEventListener('click', () => {
    dispatch({ type: 'BACK_TO_MENU' });
  });

  container.querySelector('#play-btn')?.addEventListener('click', () => {
    dispatch({ type: 'START_GAME' });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-difficulty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      dispatch({ type: 'SELECT_DIFFICULTY', difficulty: btn.dataset.difficulty as Difficulty });
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach((btn) => {
    btn.addEventListener('click', () => {
      dispatch({ type: 'SELECT_SYMBOL', symbol: btn.dataset.symbol as Player });
    });
  });
}

/** Patch selected states without tearing down the whole screen. */
export function updateSetup(container: HTMLElement, state: GameState): void {
  container.querySelectorAll<HTMLButtonElement>('[data-difficulty]').forEach((btn) => {
    const active = btn.dataset.difficulty === state.difficulty;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', String(active));
  });

  container.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach((btn) => {
    const active = btn.dataset.symbol === state.humanSymbol;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', String(active));
  });
}
