/**
 * All user-facing text strings, externalized for future i18n.
 * Import this module wherever display text is needed.
 */

export const STRINGS = {
  // App
  APP_TITLE: 'Tic Tac Toe',
  APP_SUBTITLE: 'A clean, minimal game.',

  // Menu
  MENU_VS_COMPUTER: 'vs Computer',
  MENU_VS_COMPUTER_DESC: 'Challenge the AI',
  MENU_VS_PLAYER: 'vs Player',
  MENU_VS_PLAYER_DESC: 'Play with a friend',

  // Setup
  SETUP_HEADING: 'Choose Difficulty',
  SETUP_MODE_LABEL: 'vs Computer',
  DIFFICULTY_EASY: 'Easy',
  DIFFICULTY_EASY_DESC: 'AI makes random moves',
  DIFFICULTY_MEDIUM: 'Medium',
  DIFFICULTY_MEDIUM_DESC: 'A decent challenge',
  DIFFICULTY_HARD: 'Hard',
  DIFFICULTY_HARD_DESC: 'Unbeatable AI',
  SETUP_PLAY_AS: 'Play as',

  // Game
  TURN_X: "X's Turn",
  TURN_O: "O's Turn",
  TURN_PLAYER_X: "Player X's Turn",
  TURN_PLAYER_O: "Player O's Turn",
  AI_THINKING: 'AI is thinking...',
  RESULT_X_WINS: 'X Wins!',
  RESULT_O_WINS: 'O Wins!',
  RESULT_DRAW: "It's a Draw!",

  // Buttons
  BTN_PLAY_AGAIN: 'Play Again',
  BTN_RESTART: 'Restart',
  BTN_MENU: 'Menu',
  BTN_BACK: 'Back',

  // Score labels
  SCORE_X: 'X',
  SCORE_X_AI_MODE: (humanIsX: boolean) => (humanIsX ? 'YOU (X)' : 'AI (X)'),
  SCORE_O_AI_MODE: (humanIsX: boolean) => (humanIsX ? 'AI (O)' : 'YOU (O)'),
  SCORE_PLAYER_X: 'PLAYER X',
  SCORE_PLAYER_O: 'PLAYER O',
  SCORE_DRAW: 'DRAW',

  // Accessibility
  A11Y_BOARD: 'Tic Tac Toe board',
  A11Y_CELL_EMPTY: (row: number, col: number) => `Row ${row}, Column ${col}, empty`,
  A11Y_CELL_OCCUPIED: (row: number, col: number, value: string) =>
    `Row ${row}, Column ${col}, ${value}`,
  A11Y_GAME_RESULT: (result: string) => `Game over. ${result}`,
  A11Y_SCORE: (x: number, draws: number, o: number) => `Score: X ${x}, Draw ${draws}, O ${o}`,
} as const;
