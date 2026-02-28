/**
 * All 8 possible winning line combinations for parameterized tests.
 */

export const WIN_COMBINATIONS = [
  { name: 'top row',       indices: [0, 1, 2] as [number, number, number] },
  { name: 'middle row',    indices: [3, 4, 5] as [number, number, number] },
  { name: 'bottom row',    indices: [6, 7, 8] as [number, number, number] },
  { name: 'left column',   indices: [0, 3, 6] as [number, number, number] },
  { name: 'middle column', indices: [1, 4, 7] as [number, number, number] },
  { name: 'right column',  indices: [2, 5, 8] as [number, number, number] },
  { name: 'main diagonal', indices: [0, 4, 8] as [number, number, number] },
  { name: 'anti-diagonal', indices: [2, 4, 6] as [number, number, number] },
] as const;
