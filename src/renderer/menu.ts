/**
 * menu.ts — Renders the mode selection screen.
 */

import type { Dispatch } from '../types';
import { STRINGS } from '../strings';

export function renderMenu(container: HTMLElement, dispatch: Dispatch): void {
  container.innerHTML = `
    <div class="screen menu-screen" role="region" aria-label="Game mode selection">
      <div class="menu-content">
        <div class="app-brand">
          <h1 class="app-title">${STRINGS.APP_TITLE}</h1>
          <p class="app-subtitle">${STRINGS.APP_SUBTITLE}</p>
        </div>
        <div class="mode-buttons" role="group" aria-label="Choose game mode">
          <button class="mode-card" data-mode="ai" type="button">
            <span class="mode-icon" aria-hidden="true">🤖</span>
            <span class="mode-label">${STRINGS.MENU_VS_COMPUTER}</span>
            <span class="mode-desc">${STRINGS.MENU_VS_COMPUTER_DESC}</span>
          </button>
          <button class="mode-card" data-mode="multiplayer" type="button">
            <span class="mode-icon" aria-hidden="true">👥</span>
            <span class="mode-label">${STRINGS.MENU_VS_PLAYER}</span>
            <span class="mode-desc">${STRINGS.MENU_VS_PLAYER_DESC}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as 'ai' | 'multiplayer';
      dispatch({ type: 'SELECT_MODE', mode });
    });
  });
}
