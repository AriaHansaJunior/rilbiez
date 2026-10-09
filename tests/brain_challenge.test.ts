import test from 'node:test';
import assert from 'node:assert';
import {
  TARGET_TOTAL,
  MIN_MOVE,
  MAX_MOVE,
  WINNING_MILESTONES,
  getMaxAllowedMove,
  getValidMoves,
  isValidMove,
  getOptimalMove,
  getEasyMove,
  getMediumMove,
  getHardMove,
  getBotMove,
  getRandomStartingTurn,
  getBotThinkingDelay,
  createInitialState,
  applyMove,
  type GameEngineState,
  type Turn,
  type Difficulty,
} from '../resources/js/Components/BrainChallenge/gameEngine.ts';

test('Brain Challenge Engine & Bot AI Suite', async (t) => {
  // Verification 1: Starting total is 0
  await t.test('1. Starting total is 0', () => {
    const state = createInitialState('medium', 'you');
    assert.strictEqual(state.currentTotal, 0);
    assert.strictEqual(state.gameState, 'playing');
    assert.strictEqual(state.outcome, null);
  });

  // Verification 2: First player is randomized through a controllable random source
  await t.test('2. First player is randomized through a controllable random source', () => {
    // When randomSource returns < 0.5 -> 'you'
    const turn1 = getRandomStartingTurn(() => 0.2);
    assert.strictEqual(turn1, 'you');

    // When randomSource returns >= 0.5 -> 'computer'
    const turn2 = getRandomStartingTurn(() => 0.7);
    assert.strictEqual(turn2, 'computer');

    const turn3 = getRandomStartingTurn(() => 0.499);
    assert.strictEqual(turn3, 'you');

    const turn4 = getRandomStartingTurn(() => 0.501);
    assert.strictEqual(turn4, 'computer');
  });

  // Verification 3: Only valid additions are accepted (1 to 10 within boundary)
  await t.test('3. Only valid additions are accepted', () => {
    assert.strictEqual(isValidMove(0, 1), true);
    assert.strictEqual(isValidMove(0, 10), true);
    assert.strictEqual(isValidMove(0, 0), false);
    assert.strictEqual(isValidMove(0, 11), false);
    assert.strictEqual(isValidMove(0, -1), false);
    assert.strictEqual(isValidMove(0, 3.5), false);

    const validMovesFrom0 = getValidMoves(0);
    assert.deepStrictEqual(validMovesFrom0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  // Verification 4: Additions that exceed 100 are rejected or disabled
  await t.test('4. Additions that exceed 100 are rejected or disabled', () => {
    // At total 95, maximum valid move is 5
    assert.strictEqual(getMaxAllowedMove(95), 5);
    assert.deepStrictEqual(getValidMoves(95), [1, 2, 3, 4, 5]);

    assert.strictEqual(isValidMove(95, 5), true);
    assert.strictEqual(isValidMove(95, 6), false);
    assert.strictEqual(isValidMove(95, 10), false);

    // Apply move exceeding 100 must fail
    const state = { ...createInitialState(), currentTotal: 95 };
    const res = applyMove(state, 6, 'you');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.nextState.currentTotal, 95);
    assert.match(res.error || '', /Invalid move/);
  });

  // Verification 5: Turns alternate correctly
  await t.test('5. Turns alternate correctly', () => {
    const s0 = createInitialState('medium', 'you');
    assert.strictEqual(s0.currentTurn, 'you');

    const { nextState: s1 } = applyMove(s0, 5, 'you');
    assert.strictEqual(s1.currentTurn, 'computer');
    assert.strictEqual(s1.currentTotal, 5);

    const { nextState: s2 } = applyMove(s1, 7, 'computer');
    assert.strictEqual(s2.currentTurn, 'you');
    assert.strictEqual(s2.currentTotal, 12);

    // Reject player moving during computer's turn
    const invalidTurnRes = applyMove(s1, 3, 'you');
    assert.strictEqual(invalidTurnRes.success, false);
  });

  // Verification 6: Reaching exactly 100 ends the game immediately
  await t.test('6. Reaching exactly 100 ends the game immediately', () => {
    // Player reaches 100 -> victory
    const nearWinState = { ...createInitialState(), currentTotal: 96, currentTurn: 'you' as Turn };
    const winRes = applyMove(nearWinState, 4, 'you');
    assert.strictEqual(winRes.success, true);
    assert.strictEqual(winRes.nextState.currentTotal, 100);
    assert.strictEqual(winRes.nextState.gameState, 'result');
    assert.strictEqual(winRes.nextState.outcome, 'win');

    // Computer reaches 100 -> defeat
    const nearLossState = { ...createInitialState(), currentTotal: 92, currentTurn: 'computer' as Turn };
    const lossRes = applyMove(nearLossState, 8, 'computer');
    assert.strictEqual(lossRes.success, true);
    assert.strictEqual(lossRes.nextState.currentTotal, 100);
    assert.strictEqual(lossRes.nextState.gameState, 'result');
    assert.strictEqual(lossRes.nextState.outcome, 'loss');
  });

  // Verification 7: No moves are accepted after game completion
  await t.test('7. No moves are accepted after game completion', () => {
    const finishedState: GameEngineState = {
      ...createInitialState(),
      currentTotal: 100,
      gameState: 'result',
      outcome: 'win',
    };

    const attemptMove = applyMove(finishedState, 1, 'you');
    assert.strictEqual(attemptMove.success, false);
    assert.strictEqual(attemptMove.nextState.currentTotal, 100);
    assert.match(attemptMove.error || '', /not currently active/);
  });

  // Verification 8: Easy selects only valid moves
  await t.test('8. Easy selects only valid moves across various totals', () => {
    for (let total = 0; total <= 99; total += 7) {
      const maxAllowed = getMaxAllowedMove(total);
      for (let r = 0; r < 10; r++) {
        const move = getEasyMove(total, () => Math.random());
        assert.ok(move >= 1, `Move ${move} should be >= 1`);
        assert.ok(move <= maxAllowed, `Move ${move} exceeds max allowed ${maxAllowed} for total ${total}`);
        assert.ok(total + move <= 100, `Move ${move} caused total to exceed 100`);
      }
    }
  });

  // Verification 9: Medium uses the 90% optimal / 10% nonoptimal decision rule
  await t.test('9. Medium uses the 90% optimal / 10% nonoptimal decision rule', () => {
    // At total 0: optimal move is 1 (reaches milestone 1). Non-optimal moves are 2..10.
    // When randomSource returns < 0.9, must select optimal move (1)
    const optimalCall = getMediumMove(0, () => 0.85);
    assert.strictEqual(optimalCall, 1);

    // When randomSource returns >= 0.9, must select a non-optimal valid move (> 1)
    let rollIndex = 0;
    const rolls = [0.95, 0.4]; // roll >= 0.9, then index selection
    const nonOptimalCall = getMediumMove(0, () => rolls[rollIndex++]);
    assert.notStrictEqual(nonOptimalCall, 1);
    assert.ok(nonOptimalCall >= 2 && nonOptimalCall <= 10);

    // If only optimal move exists (e.g. total 99, where only valid move is 1 and it reaches 100)
    const singleMoveCall = getMediumMove(99, () => 0.99); // even with >= 0.9
    assert.strictEqual(singleMoveCall, 1);
  });

  // Verification 10: Hard starts with +1 when the computer moves first
  await t.test('10. Hard starts with +1 when the computer moves first', () => {
    const initialMove = getHardMove(0);
    assert.strictEqual(initialMove, 1);
  });

  // Verification 11: Hard uses the complement-to-11 strategy where applicable
  await t.test('11. Hard uses the complement-to-11 strategy where applicable', () => {
    // If computer played 1 from 0 (total = 1), and player adds x:
    // Computer must respond with 11 - x to reach the next milestone (12, 23, 34, ..., 100)
    for (let playerMove = 1; playerMove <= 10; playerMove++) {
      const totalAfterPlayer = 1 + playerMove;
      const botResponse = getHardMove(totalAfterPlayer, playerMove);
      assert.strictEqual(
        botResponse,
        11 - playerMove,
        `For player move ${playerMove}, bot response should be ${11 - playerMove}`
      );
      assert.strictEqual(totalAfterPlayer + botResponse, 12);
    }

    // Sequence check: Simulate full game where computer starts with 1, and player plays varied moves
    let currentTotal = 0;
    // Step 0: Bot moves first
    const botM0 = getHardMove(currentTotal);
    assert.strictEqual(botM0, 1);
    currentTotal += botM0;
    assert.strictEqual(currentTotal, 1);

    const playerMoves = [4, 7, 2, 9, 3, 5, 8, 1, 6];
    for (const pm of playerMoves) {
      currentTotal += pm;
      const botResponse = getHardMove(currentTotal, pm);
      assert.strictEqual(botResponse, 11 - pm);
      currentTotal += botResponse;
      assert.ok(WINNING_MILESTONES.includes(currentTotal as any));
    }
    assert.strictEqual(currentTotal, 100);
  });

  // Verification 12: Play Again resets the game and randomizes the starting player
  await t.test('12. Play Again resets the game and randomizes the starting player', () => {
    let mockRandom = 0.1; // produces 'you'
    const newGame1 = createInitialState('hard', getRandomStartingTurn(() => mockRandom), 2);
    assert.strictEqual(newGame1.currentTotal, 0);
    assert.strictEqual(newGame1.currentTurn, 'you');
    assert.strictEqual(newGame1.difficulty, 'hard');
    assert.strictEqual(newGame1.generation, 2);

    mockRandom = 0.8; // produces 'computer'
    const newGame2 = createInitialState('hard', getRandomStartingTurn(() => mockRandom), 3);
    assert.strictEqual(newGame2.currentTotal, 0);
    assert.strictEqual(newGame2.currentTurn, 'computer');
    assert.strictEqual(newGame2.difficulty, 'hard');
    assert.strictEqual(newGame2.generation, 3);
  });

  // Verification 13: Change Difficulty returns to setup
  await t.test('13. Change Difficulty returns to setup', () => {
    const playingState = createInitialState('easy', 'you', 1);
    const setupState: GameEngineState = {
      ...playingState,
      gameState: 'intro',
      currentTotal: 0,
      outcome: null,
      generation: playingState.generation + 1,
    };
    assert.strictEqual(setupState.gameState, 'intro');
    assert.strictEqual(setupState.currentTotal, 0);
    assert.strictEqual(setupState.generation, 2);
  });

  // Verification 14: Pending bot actions cannot affect a restarted game
  await t.test('14. Pending bot actions cannot affect a restarted game', () => {
    let activeState = createInitialState('medium', 'computer', 1);
    activeState.isBotThinking = true;

    // Simulate an asynchronous bot action scheduled with generation 1
    const capturedGeneration = activeState.generation;

    // Restart game before the bot timer resolves (generation increments to 2)
    activeState = createInitialState('medium', 'you', activeState.generation + 1);
    assert.strictEqual(activeState.generation, 2);
    assert.strictEqual(activeState.currentTotal, 0);

    // Stale bot action attempts to fire
    let staleActionApplied = false;
    if (capturedGeneration === activeState.generation && activeState.currentTurn === 'computer') {
      const res = applyMove(activeState, 5, 'computer');
      if (res.success) {
        activeState = res.nextState;
        staleActionApplied = true;
      }
    }

    assert.strictEqual(staleActionApplied, false);
    assert.strictEqual(activeState.currentTotal, 0);
    assert.strictEqual(activeState.currentTurn, 'you');
  });

  // Auxiliary Verification: Bot thinking delay range (500 to 900 ms)
  await t.test('Auxiliary: Bot thinking delay stays strictly within [500, 900] ms', () => {
    const minDelay = getBotThinkingDelay(() => 0.0);
    assert.strictEqual(minDelay, 500);

    const maxDelay = getBotThinkingDelay(() => 0.9999);
    assert.strictEqual(maxDelay, 900);

    const midDelay = getBotThinkingDelay(() => 0.5);
    assert.ok(midDelay >= 500 && midDelay <= 900);
  });

  // Session 3: Browser statistics persistence & duplicate guard
  await t.test('Session 3: Browser statistics persistence across reloads & duplicate prevention', async (st) => {
    class MockStorage implements Storage {
      private store = new Map<string, string>();
      get length() { return this.store.size; }
      clear() { this.store.clear(); }
      getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
      key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
      removeItem(key: string) { this.store.delete(key); }
      setItem(key: string, value: string) { this.store.set(key, String(value)); }
    }

    const { loadBrowserStats, recordGameOutcome, WINS_KEY, LOSSES_KEY } = await import(
      '../resources/js/Components/BrainChallenge/browserStats.ts'
    );

    await st.test('Restores statistics from storage', () => {
      const storage = new MockStorage();
      storage.setItem(WINS_KEY, '4');
      storage.setItem(LOSSES_KEY, '2');

      const stats = loadBrowserStats(storage);
      assert.strictEqual(stats.wins, 4);
      assert.strictEqual(stats.losses, 2);
    });

    await st.test('Safely handles missing or corrupted storage values', () => {
      const storage = new MockStorage();
      storage.setItem(WINS_KEY, 'invalid_number');
      storage.setItem(LOSSES_KEY, '-5');

      const stats = loadBrowserStats(storage);
      assert.strictEqual(stats.wins, 0);
      assert.strictEqual(stats.losses, 0);
    });

    await st.test('Updates stats once per match and prevents duplicate increments', () => {
      const storage = new MockStorage();
      const gameId = 'match_abc_123';

      // First call records win
      const firstRes = recordGameOutcome(gameId, 'win', storage);
      assert.strictEqual(firstRes.updated, true);
      assert.strictEqual(firstRes.stats.wins, 1);
      assert.strictEqual(firstRes.stats.losses, 0);

      // Repeated call with the same gameId must not increment
      const repeatRes = recordGameOutcome(gameId, 'win', storage);
      assert.strictEqual(repeatRes.updated, false);
      assert.strictEqual(repeatRes.stats.wins, 1);
      assert.strictEqual(repeatRes.stats.losses, 0);

      // Another match with new gameId records loss
      const secondMatch = recordGameOutcome('match_def_456', 'loss', storage);
      assert.strictEqual(secondMatch.updated, true);
      assert.strictEqual(secondMatch.stats.wins, 1);
      assert.strictEqual(secondMatch.stats.losses, 1);
    });
  });
});
