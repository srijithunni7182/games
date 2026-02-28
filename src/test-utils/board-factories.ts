/**
 * Shared test utilities: factory functions for common board states.
 * Used across unit, component, and integration tests.
 */

import type { CellValue } from '../types';

export type BoardArray = (CellValue)[];

export const boards = {
  empty: (): BoardArray => Array(9).fill(null),

  // Win states
  xWinsTopRow: (): BoardArray => ['X', 'X', 'X', 'O', 'O', null, null, null, null],
  xWinsMiddleRow: (): BoardArray => ['O', null, null, 'X', 'X', 'X', null, 'O', null],
  xWinsBottomRow: (): BoardArray => [null, null, null, 'O', 'O', null, 'X', 'X', 'X'],
  xWinsLeftCol: (): BoardArray => ['X', 'O', null, 'X', 'O', null, 'X', null, null],
  xWinsMiddleCol: (): BoardArray => ['O', 'X', null, null, 'X', null, 'O', 'X', null],
  xWinsRightCol: (): BoardArray => [null, 'O', 'X', null, 'O', 'X', null, null, 'X'],
  xWinsMainDiag: (): BoardArray => ['X', 'O', null, null, 'X', 'O', null, null, 'X'],
  xWinsAntiDiag: (): BoardArray => [null, 'O', 'X', 'O', 'X', null, 'X', null, null],

  oWinsTopRow: (): BoardArray => ['O', 'O', 'O', 'X', 'X', null, null, null, null],
  oWinsLeftCol: (): BoardArray => ['O', 'X', null, 'O', 'X', null, 'O', null, null],
  oWinsMainDiag: (): BoardArray => ['O', 'X', null, null, 'O', 'X', null, null, 'O'],

  // Draw state - no winner, all filled
  draw: (): BoardArray => ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],

  // Near-terminal states
  aiCanWin: (): BoardArray => ['O', 'O', null, 'X', 'X', null, null, null, null],
  aiMustBlock: (): BoardArray => ['X', 'X', null, 'O', null, null, null, null, null],

  // 8 cells filled, one empty
  oneMoveLeft: (emptyIndex: number): BoardArray => {
    const board: BoardArray = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    board[emptyIndex] = null;
    return board;
  },
};
