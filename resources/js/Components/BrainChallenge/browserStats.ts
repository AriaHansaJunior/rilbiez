export interface BrowserStats {
  wins: number;
  losses: number;
}

export const WINS_KEY = 'brain_challenge_wins';
export const LOSSES_KEY = 'brain_challenge_losses';
export const RECORDED_GAMES_KEY = 'brain_challenge_recorded_games';

/**
 * Safely reads integer from storage, defaulting to 0 if absent, negative, or corrupt.
 */
function safeGetInt(storage: Storage, key: string): number {
  try {
    const val = storage.getItem(key);
    if (!val) return 0;
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * Loads browser statistics from localStorage.
 */
export function loadBrowserStats(storage: Storage = window.localStorage): BrowserStats {
  try {
    return {
      wins: safeGetInt(storage, WINS_KEY),
      losses: safeGetInt(storage, LOSSES_KEY),
    };
  } catch {
    return { wins: 0, losses: 0 };
  }
}

/**
 * Records a game outcome into localStorage exactly once per unique gameId.
 * Returns the updated stats, or existing stats if game was already recorded.
 */
export function recordGameOutcome(
  gameId: string,
  outcome: 'win' | 'loss',
  storage: Storage = window.localStorage
): { stats: BrowserStats; updated: boolean } {
  try {
    // Check if game was already recorded to prevent duplicate increments
    let recordedGames: string[] = [];
    try {
      const recordedRaw = storage.getItem(RECORDED_GAMES_KEY);
      if (recordedRaw) {
        const parsed = JSON.parse(recordedRaw);
        if (Array.isArray(parsed)) {
          recordedGames = parsed;
        }
      }
    } catch {
      recordedGames = [];
    }

    if (recordedGames.includes(gameId)) {
      return { stats: loadBrowserStats(storage), updated: false };
    }

    // Load current stats
    const currentWins = safeGetInt(storage, WINS_KEY);
    const currentLosses = safeGetInt(storage, LOSSES_KEY);

    const newWins = outcome === 'win' ? currentWins + 1 : currentWins;
    const newLosses = outcome === 'loss' ? currentLosses + 1 : currentLosses;

    // Save updated stats
    storage.setItem(WINS_KEY, newWins.toString());
    storage.setItem(LOSSES_KEY, newLosses.toString());

    // Record game ID (capped to last 100 to avoid unbounded storage)
    recordedGames.push(gameId);
    if (recordedGames.length > 100) {
      recordedGames = recordedGames.slice(-100);
    }
    storage.setItem(RECORDED_GAMES_KEY, JSON.stringify(recordedGames));

    return { stats: { wins: newWins, losses: newLosses }, updated: true };
  } catch {
    return { stats: loadBrowserStats(storage), updated: false };
  }
}
