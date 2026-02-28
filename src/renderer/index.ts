/**
 * renderer/index.ts — Orchestrates which screen to render and when to patch vs. replace.
 */

import type { GameState, Screen, Dispatch } from '../types';
import { renderMenu } from './menu';
import { renderSetup, updateSetup } from './setup';
import { renderGame, updateGame } from './game';

export interface Renderer {
  render(state: GameState): void;
}

export function createRenderer(container: HTMLElement, dispatch: Dispatch): Renderer {
  let currentScreen: Screen | null = null;

  return {
    render(state: GameState) {
      if (state.screen !== currentScreen) {
        // Screen transition — clear and fully re-render
        currentScreen = state.screen;
        container.innerHTML = '';

        switch (state.screen) {
          case 'menu':
            renderMenu(container, dispatch);
            break;
          case 'setup':
            renderSetup(container, state, dispatch);
            break;
          case 'game':
            renderGame(container, state, dispatch);
            break;
        }
      } else {
        // Same screen — patch only the dynamic parts
        switch (state.screen) {
          case 'setup':
            updateSetup(container, state);
            break;
          case 'game':
            updateGame(container, state, dispatch);
            break;
          // 'menu' is fully static — no patch needed
        }
      }
    },
  };
}
