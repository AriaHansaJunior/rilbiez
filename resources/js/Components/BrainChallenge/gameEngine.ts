export type Difficulty = 'easy' | 'medium' | 'hard';
export type Turn = 'you' | 'computer';
export type GameState = 'intro' | 'playing' | 'result';
export type ResultOutcome = 'win' | 'loss';

export const TARGET_TOTAL = 100;
export const MIN_MOVE = 1;
export const MAX_MOVE = 10;
export const MIN_BOT_DELAY = 500;
export const MAX_BOT_DELAY = 900;

export const WINNING_MILESTONES = [1, 12, 23, 34, 45, 56, 67, 78, 89, 100] as const;

export interface GameEngineState {
  gameState: GameState;
  difficulty: Difficulty;
  currentTotal: number;
  currentTurn: Turn;
  isBotThinking: boolean;
  outcome: ResultOutcome | null;
  lastPlayerMove?: number;
  lastBotMove?: number;
  generation: number; // Incrementing ID to invalidate stale async bot actions
}

/**
 * Returns the maximum addition permitted given the current total.
 */
export function getMaxAllowedMove(currentTotal: number): number {
  return Math.max(0, Math.min(MAX_MOVE, TARGET_TOTAL - currentTotal));
}

/**
 * Returns all valid moves for a given total.
 */
export function getValidMoves(currentTotal: number): number[] {
  const maxMove = getMaxAllowedMove(currentTotal);
  const moves: number[] = [];
  for (let m = MIN_MOVE; m <= maxMove; m++) {
    moves.push(m);
  }
  return moves;
}

/**
 * Verifies if an addition is strictly valid for the current total.
 */
export function isValidMove(currentTotal: number, move: number): boolean {
  if (!Number.isInteger(move)) return false;
  if (move < MIN_MOVE || move > MAX_MOVE) return false;
  return currentTotal + move <= TARGET_TOTAL;
}

/**
 * Calculates the mathematically optimal move to land on a target milestone (1, 12, 23, ..., 100).
 * Returns null if the current position is already a milestone or no single move can reach one.
 */
export function getOptimalMove(currentTotal: number): number | null {
  if (currentTotal >= TARGET_TOTAL) return null;
  const maxAllowed = getMaxAllowedMove(currentTotal);

  for (const milestone of WINNING_MILESTONES) {
    const diff = milestone - currentTotal;
    if (diff >= MIN_MOVE && diff <= maxAllowed) {
      return diff;
    }
  }

  return null;
}

/**
 * Easy Bot Strategy:
 * Chooses a uniformly random valid move from 1 through the maximum allowed addition.
 * Never chooses an invalid move.
 */
export function getEasyMove(
  currentTotal: number,
  randomSource: () => number = Math.random
): number {
  const validMoves = getValidMoves(currentTotal);
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }
  const idx = Math.floor(randomSource() * validMoves.length);
  return validMoves[idx];
}

/**
 * Medium Bot Strategy:
 * Chooses an optimal move with 90% probability.
 * Chooses a non-optimal valid move with 10% probability.
 * If no non-optimal valid move exists, chooses the valid optimal move.
 */
export function getMediumMove(
  currentTotal: number,
  randomSource: () => number = Math.random
): number {
  const validMoves = getValidMoves(currentTotal);
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  const optimalMove = getOptimalMove(currentTotal);

  if (optimalMove !== null) {
    const nonOptimalMoves = validMoves.filter((m) => m !== optimalMove);
    const roll = randomSource();

    if (roll < 0.9 || nonOptimalMoves.length === 0) {
      return optimalMove;
    } else {
      const idx = Math.floor(randomSource() * nonOptimalMoves.length);
      return nonOptimalMoves[idx];
    }
  }

  // If currently on a milestone (no single move reaches next milestone)
  const idx = Math.floor(randomSource() * validMoves.length);
  return validMoves[idx];
}

/**
 * Hard Bot Strategy:
 * Uses the deterministic optimal strategy for the target-100 game.
 * 1. If starting from 0, first move is +1.
 * 2. Subsequently, responds to player addition x with 11 - x whenever valid.
 * 3. Aims to leave totals 1, 12, 23, 34, 45, 56, 67, 78, 89, 100 after computer's turns.
 * 4. If player started first and plays optimally, chooses best available move.
 */
export function getHardMove(currentTotal: number, lastPlayerMove?: number): number {
  if (currentTotal >= TARGET_TOTAL) {
    throw new Error('Game has already completed');
  }
  const maxAllowed = getMaxAllowedMove(currentTotal);

  // Rule 1: Starting from 0, computer must move +1
  if (currentTotal === 0) {
    return 1;
  }

  // Rule 2: Respond with 11 - x if valid and maintains/reaches milestone
  if (lastPlayerMove !== undefined) {
    const comp = 11 - lastPlayerMove;
    if (comp >= MIN_MOVE && comp <= maxAllowed) {
      const nextTotal = currentTotal + comp;
      if (nextTotal === TARGET_TOTAL || nextTotal % 11 === 1) {
        return comp;
      }
    }
  }

  // Rule 3: Direct optimal move targeting nearest milestone
  const optimal = getOptimalMove(currentTotal);
  if (optimal !== null) {
    return optimal;
  }

  // Fallback: If player is already on a milestone, choose 1 (best available move)
  return 1;
}

/**
 * Dispatches the bot move based on selected difficulty.
 */
export function getBotMove(
  difficulty: Difficulty,
  currentTotal: number,
  lastPlayerMove?: number,
  randomSource: () => number = Math.random
): number {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(currentTotal, randomSource);
    case 'medium':
      return getMediumMove(currentTotal, randomSource);
    case 'hard':
      return getHardMove(currentTotal, lastPlayerMove);
  }
}

/**
 * Randomizes the starting player at the start of every new game.
 */
export function getRandomStartingTurn(randomSource: () => number = Math.random): Turn {
  return randomSource() < 0.5 ? 'you' : 'computer';
}

/**
 * Generates a randomized bot thinking delay between 500 and 900 ms.
 */
export function getBotThinkingDelay(randomSource: () => number = Math.random): number {
  return MIN_BOT_DELAY + Math.floor(randomSource() * (MAX_BOT_DELAY - MIN_BOT_DELAY + 1));
}

/**
 * Creates a fresh game engine state.
 */
export function createInitialState(
  difficulty: Difficulty = 'medium',
  startingTurn: Turn = 'you',
  generation: number = 1
): GameEngineState {
  return {
    gameState: 'playing',
    difficulty,
    currentTotal: 0,
    currentTurn: startingTurn,
    isBotThinking: false,
    outcome: null,
    generation,
  };
}

/**
 * Applies a player or bot move to the game state.
 * Rejects invalid moves and transitions the game when TARGET_TOTAL (100) is reached.
 */
export function applyMove(
  state: GameEngineState,
  move: number,
  player: Turn
): { success: boolean; nextState: GameEngineState; error?: string } {
  if (state.gameState !== 'playing') {
    return { success: false, nextState: state, error: 'Game is not currently active' };
  }

  if (state.currentTurn !== player) {
    return { success: false, nextState: state, error: `Not ${player}'s turn` };
  }

  if (!isValidMove(state.currentTotal, move)) {
    return {
      success: false,
      nextState: state,
      error: `Invalid move ${move} for current total ${state.currentTotal}`,
    };
  }

  const nextTotal = state.currentTotal + move;
  const isFinished = nextTotal >= TARGET_TOTAL;

  const nextState: GameEngineState = {
    ...state,
    currentTotal: nextTotal,
    lastPlayerMove: player === 'you' ? move : state.lastPlayerMove,
    lastBotMove: player === 'computer' ? move : state.lastBotMove,
    currentTurn: player === 'you' ? 'computer' : 'you',
    isBotThinking: false,
    gameState: isFinished ? 'result' : 'playing',
    outcome: isFinished ? (player === 'you' ? 'win' : 'loss') : null,
  };

  return { success: true, nextState };
}
