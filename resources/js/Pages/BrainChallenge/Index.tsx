import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { BackgroundMotion } from '../../Components/Motion/BackgroundMotion';
import {
  TARGET_TOTAL,
  type Difficulty,
  type Turn,
  type GameState,
  type ResultOutcome,
  isValidMove,
  getBotMove,
  getRandomStartingTurn,
  getBotThinkingDelay,
} from '../../Components/BrainChallenge/gameEngine';
import {
  loadBrowserStats,
  recordGameOutcome,
  type BrowserStats,
} from '../../Components/BrainChallenge/browserStats';

interface RecordedMove {
  move_number: number;
  actor: Turn;
  added_number: number;
  total_after: number;
  move_time: string;
}

export default function BrainChallenge() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<Turn>('you');
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<ResultOutcome | null>(null);
  const [browserStats, setBrowserStats] = useState<BrowserStats>({ wins: 0, losses: 0 });

  // Refs for robust async turn management and persistence tracking
  const generationRef = useRef<number>(1);
  const currentNumberRef = useRef<number>(0);
  const difficultyRef = useRef<Difficulty>(difficulty);
  const lastPlayerMoveRef = useRef<number | undefined>(undefined);

  // Persistence tracking refs
  const gameIdRef = useRef<string>('');
  const startedAtRef = useRef<string>('');
  const firstPlayerRef = useRef<Turn>('you');
  const movesHistoryRef = useRef<RecordedMove[]>([]);
  const hasPersistedRef = useRef<boolean>(false);

  // Load local browser statistics on mount
  useEffect(() => {
    setBrowserStats(loadBrowserStats());
  }, []);

  // Keep refs synchronized with state
  useEffect(() => {
    currentNumberRef.current = currentNumber;
  }, [currentNumber]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // Persist completed match to database and local browser storage
  const handleGameCompletion = (finalOutcome: ResultOutcome, finalMoves: RecordedMove[]) => {
    if (hasPersistedRef.current) return;
    hasPersistedRef.current = true;

    const completedAt = new Date().toISOString();
    const gameId = gameIdRef.current;

    // 1. Update local browser statistics (localStorage)
    const { stats } = recordGameOutcome(gameId, finalOutcome);
    setBrowserStats(stats);

    // 2. Persist full match and sequential moves to database
    const payload = {
      game_id: gameId,
      difficulty: difficultyRef.current,
      first_player: firstPlayerRef.current,
      final_result: finalOutcome === 'win' ? 'you' : 'computer',
      final_total: TARGET_TOTAL,
      started_at: startedAtRef.current,
      completed_at: completedAt,
      moves: finalMoves,
    };

    fetch('/brain-challenge/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // Non-blocking error handling: ensure gameplay remains smooth even if network fails
      console.warn('Brain Challenge match persistence warning:', err);
    });
  };

  // Start a fresh challenge
  const handleStart = () => {
    generationRef.current += 1;
    setCurrentNumber(0);
    currentNumberRef.current = 0;
    lastPlayerMoveRef.current = undefined;
    setIsBotThinking(false);
    setOutcome(null);

    const firstTurn = getRandomStartingTurn();
    setCurrentTurn(firstTurn);

    // Initialize persistence session metadata
    gameIdRef.current = 'bc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    startedAtRef.current = new Date().toISOString();
    firstPlayerRef.current = firstTurn;
    movesHistoryRef.current = [];
    hasPersistedRef.current = false;

    setGameState('playing');
  };

  // Human player makes a move
  const handlePlayerMove = (num: number) => {
    if (gameState !== 'playing' || currentTurn !== 'you' || isBotThinking) {
      return;
    }

    if (!isValidMove(currentNumber, num)) {
      return;
    }

    const nextTotal = currentNumber + num;
    lastPlayerMoveRef.current = num;
    setCurrentNumber(nextTotal);
    currentNumberRef.current = nextTotal;

    // Record sequential move
    const newMove: RecordedMove = {
      move_number: movesHistoryRef.current.length + 1,
      actor: 'you',
      added_number: num,
      total_after: nextTotal,
      move_time: new Date().toISOString(),
    };
    movesHistoryRef.current.push(newMove);

    if (nextTotal >= TARGET_TOTAL) {
      setOutcome('win');
      setGameState('result');
      setIsBotThinking(false);
      handleGameCompletion('win', [...movesHistoryRef.current]);
    } else {
      setCurrentTurn('computer');
    }
  };

  // Bot Turn Management with randomized thinking delay & clean cancellation
  useEffect(() => {
    if (gameState !== 'playing') {
      setIsBotThinking(false);
      return;
    }

    if (currentTurn !== 'computer') {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const activeGeneration = generationRef.current;
    const thinkingDelay = getBotThinkingDelay();

    const botTimeout = setTimeout(() => {
      // Invalidation check: Ensure this timeout belongs to the current active game
      if (activeGeneration !== generationRef.current) {
        return;
      }

      const totalAtTurn = currentNumberRef.current;
      if (totalAtTurn >= TARGET_TOTAL) {
        return;
      }

      // Compute bot move from deterministic/probabilistic strategies
      const botMove = getBotMove(
        difficultyRef.current,
        totalAtTurn,
        lastPlayerMoveRef.current
      );

      const nextTotal = totalAtTurn + botMove;
      setCurrentNumber(nextTotal);
      currentNumberRef.current = nextTotal;
      setIsBotThinking(false);

      // Record sequential bot move
      const newMove: RecordedMove = {
        move_number: movesHistoryRef.current.length + 1,
        actor: 'computer',
        added_number: botMove,
        total_after: nextTotal,
        move_time: new Date().toISOString(),
      };
      movesHistoryRef.current.push(newMove);

      if (nextTotal >= TARGET_TOTAL) {
        setOutcome('loss');
        setGameState('result');
        handleGameCompletion('loss', [...movesHistoryRef.current]);
      } else {
        setCurrentTurn('you');
      }
    }, thinkingDelay);

    return () => {
      clearTimeout(botTimeout);
    };
  }, [currentTurn, gameState]);

  // Play Again: Restarts fresh game with same difficulty & new randomized turn
  const handlePlayAgain = () => {
    generationRef.current += 1;
    setCurrentNumber(0);
    currentNumberRef.current = 0;
    lastPlayerMoveRef.current = undefined;
    setIsBotThinking(false);
    setOutcome(null);

    const firstTurn = getRandomStartingTurn();
    setCurrentTurn(firstTurn);

    // Initialize fresh persistence session metadata
    gameIdRef.current = 'bc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    startedAtRef.current = new Date().toISOString();
    firstPlayerRef.current = firstTurn;
    movesHistoryRef.current = [];
    hasPersistedRef.current = false;

    setGameState('playing');
  };

  // Change Difficulty: Cancels actions and returns to setup view
  const handleChangeDifficulty = () => {
    generationRef.current += 1;
    setCurrentNumber(0);
    currentNumberRef.current = 0;
    lastPlayerMoveRef.current = undefined;
    setIsBotThinking(false);
    setOutcome(null);
    hasPersistedRef.current = false;
    setGameState('intro');
  };

  const difficultyMeta: Record<Difficulty, { label: string; badge: string; desc: string; color: string }> = {
    easy: {
      label: 'Easy',
      badge: 'EXPLORATORY',
      desc: 'Relaxed cognitive sparring with opportunistic moves.',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    medium: {
      label: 'Medium',
      badge: 'STRATEGIC',
      desc: 'Tactical arithmetic foresight targeting key milestone multiples.',
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    },
    hard: {
      label: 'Hard',
      badge: 'MINIMAX OPTIMAL',
      desc: 'Rigorous mathematical precision that punishes sub-optimal intervals.',
      color: 'border-accent/60 text-accent bg-accent/10',
    },
  };

  return (
    <div className="relative h-screen max-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-white flex flex-col font-sans overflow-hidden">
      {/* Background Motion Layer */}
      <BackgroundMotion />

      {/* Top Bar Navigation */}
      <header className="relative z-20 w-full flex-shrink-0 border-b border-edge/80 bg-[#090A0F]/85 backdrop-blur-md">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between">
          {/* Back to RILBIEZ Link */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-dim hover:text-fg font-mono text-[12px] sm:text-[13px] tracking-wide border border-edge/80 hover:border-accent/60 bg-surface/70 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>Back to RILBIEZ</span>
          </Link>

          {/* Module Identifier & Target Indicator */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-mono text-[11px] text-accent tracking-[0.18em] uppercase font-medium">
              NEURAL WARM-UP
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-edge" />
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-[12px] text-fg bg-surface/90 border border-edge px-2.5 py-1 rounded">
              <span className="text-dim">TARGET:</span>
              <span className="text-accent font-bold">100</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Centered and compact */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        <div className="w-full max-w-[760px] mx-auto">
          {/* =========================================================================
              VIEW 1: INTRODUCTION & SETUP (gameState === 'intro')
             ========================================================================= */}
          {gameState === 'intro' && (
            <div className="rounded-2xl border border-edge bg-surface/90 backdrop-blur-md p-5 sm:p-7 shadow-2xl transition-all">
              {/* Introduction Header */}
              <div className="mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.2em] text-accent uppercase font-medium">
                    COGNITIVE EXERCISE // 01
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-fg mb-2">
                  Target 100 Warm-Up
                </h1>
                <p className="text-dim text-xs sm:text-[13.5px] leading-relaxed max-w-2xl">
                  A focused mental arithmetic sparring challenge to awaken strategic foresight. You and the computer
                  take turns adding any integer from <strong className="text-fg font-mono">+1 to +10</strong> to a
                  shared running count. The mind that secures exactly <strong className="text-accent font-mono">100</strong> claims victory.
                </p>
              </div>

              {/* Rules of Engagement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                <div className="p-3 rounded-xl border border-edge/70 bg-bg/60">
                  <span className="font-mono text-[9.5px] text-accent tracking-widest block mb-0.5">01 / MECHANIC</span>
                  <p className="text-[11.5px] text-dim leading-snug">
                    Choose an addition step between <span className="text-fg font-mono">+1</span> and{' '}
                    <span className="text-fg font-mono">+10</span> on each turn.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-edge/70 bg-bg/60">
                  <span className="font-mono text-[9.5px] text-accent tracking-widest block mb-0.5">02 / SEQUENCE</span>
                  <p className="text-[11.5px] text-dim leading-snug">
                    Alternate turns seamlessly with the system. Count increments in real time.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-edge/70 bg-bg/60">
                  <span className="font-mono text-[9.5px] text-accent tracking-widest block mb-0.5">03 / OBJECTIVE</span>
                  <p className="text-[11.5px] text-dim leading-snug">
                    Anticipate milestone multiples to force your opponent and land on <span className="text-accent font-mono font-semibold">100</span>.
                  </p>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-5 sm:mb-6">
                <label className="block font-mono text-[10px] sm:text-[10.5px] tracking-widest text-dim uppercase mb-2.5">
                  SELECT DIFFICULTY
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                    const meta = difficultyMeta[d];
                    const isSelected = difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={[
                          'relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[88px]',
                          isSelected
                            ? 'border-accent bg-accent/10 shadow-md shadow-accent/5 ring-1 ring-accent'
                            : 'border-edge bg-bg/40 hover:border-edge/90 hover:bg-bg/70',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-fg text-xs sm:text-[13px] tracking-wide">{meta.label}</span>
                          <span
                            className={[
                              'font-mono text-[8.5px] tracking-wider px-1.5 py-0.5 rounded border uppercase',
                              meta.color,
                            ].join(' ')}
                          >
                            {meta.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-dim leading-snug">{meta.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Challenge Button - Centered */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-h text-white font-medium text-[13.5px] px-8 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/25"
                >
                  <span>Start Challenge</span>
                  <span className="font-mono text-base">→</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: ACTIVE GAME ARENA (gameState === 'playing')
             ========================================================================= */}
          {gameState === 'playing' && (
            <div className="rounded-2xl border border-edge bg-surface/90 backdrop-blur-md p-5 sm:p-7 shadow-2xl transition-all">
              {/* Arena Header Bar: Difficulty & Turn Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-edge/80">
                {/* Visual Indication of Selected Difficulty */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9.5px] tracking-widest text-dim uppercase">DIFFICULTY:</span>
                  <span
                    className={[
                      'font-mono text-[9.5px] tracking-widest px-2 py-0.5 rounded border uppercase font-medium',
                      difficultyMeta[difficulty].color,
                    ].join(' ')}
                  >
                    {difficultyMeta[difficulty].label} ({difficultyMeta[difficulty].badge})
                  </span>
                </div>

                {/* Turn Indicator: You vs Computer */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9.5px] tracking-widest text-dim uppercase">CURRENT TURN:</span>
                  {currentTurn === 'you' ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[10.5px] font-semibold tracking-wide animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      YOU
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-400 font-mono text-[10.5px] font-semibold tracking-wide animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {isBotThinking ? 'COMPUTER (THINKING...)' : 'COMPUTER'}
                    </div>
                  )}
                </div>
              </div>

              {/* Prominent Current-Number Display & Target Progress */}
              <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase mb-1">
                  CURRENT RUNNING TOTAL
                </span>

                {/* Big Number */}
                <div className="relative my-1">
                  <span className="font-mono text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter text-fg drop-shadow-[0_0_20px_rgba(200,77,22,0.15)]">
                    {currentNumber}
                  </span>
                  <span className="text-dim/40 font-mono text-xl sm:text-2xl ml-2">/ 100</span>
                </div>

                {/* Progress Bar towards 100 */}
                <div className="w-full max-w-sm mt-3">
                  <div className="w-full h-1.5 bg-edge/70 rounded-full overflow-hidden p-0.5 border border-edge/40">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-h rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, currentNumber)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-dim mt-1">
                    <span>0 START</span>
                    <span>50 MID</span>
                    <span className="text-accent font-semibold">100 GOAL</span>
                  </div>
                </div>
              </div>

              {/* Number Addition Controls (+1 to +10) */}
              <div className="pt-3.5 border-t border-edge/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] sm:text-[10.5px] tracking-widest text-dim uppercase">
                    CHOOSE YOUR ADDITION (+1 TO +10)
                  </span>
                  <span className="font-mono text-[9.5px] text-accent">
                    {TARGET_TOTAL - currentNumber > 0
                      ? `${TARGET_TOTAL - currentNumber} to target`
                      : 'Goal achieved'}
                  </span>
                </div>

                {/* Keypad Grid for +1 .. +10 */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isExceeding = !isValidMove(currentNumber, num);
                    const isDisabled = isBotThinking || currentTurn !== 'you' || isExceeding;
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handlePlayerMove(num)}
                        className={[
                          'py-2.5 sm:py-3 rounded-lg font-mono text-xs sm:text-sm font-bold border transition-all duration-200 flex flex-col items-center justify-center select-none',
                          isDisabled
                            ? 'opacity-30 border-edge/40 bg-bg/20 text-dim cursor-not-allowed'
                            : 'cursor-pointer border-edge bg-bg/60 text-fg hover:border-accent hover:text-accent hover:bg-accent/5 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-accent/10',
                        ].join(' ')}
                      >
                        +{num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status footer without any debug controls */}
              <div className="mt-5 pt-3 border-t border-edge/40 flex items-center justify-between text-[11px] font-mono text-dim">
                <span>Turn-Based Addition (Target 100)</span>
                <span>
                  {isBotThinking
                    ? 'System is evaluating moves...'
                    : currentTurn === 'you'
                    ? 'Your turn to play'
                    : 'Awaiting system move'}
                </span>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: RESULT STATE LAYOUT (gameState === 'result')
             ========================================================================= */}
          {gameState === 'result' && (
            <div className="rounded-2xl border border-edge bg-surface/90 backdrop-blur-md p-5 sm:p-7 shadow-2xl transition-all text-center">
              {/* Outcome Badge & Title */}
              <div className="mb-4 flex flex-col items-center">
                {outcome === 'win' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xl font-bold mb-2.5 shadow-lg shadow-emerald-500/10 animate-bounce">
                      ★
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-semibold mb-1">
                      CHALLENGE ACCOMPLISHED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                      Victory! Target 100 Reached
                    </h2>
                    <p className="text-dim text-xs sm:text-sm mt-1 max-w-md">
                      Superior calculation. You landed precisely on the target milestone of 100.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent font-mono text-xl font-bold mb-2.5 shadow-lg shadow-accent/10">
                      ✕
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase font-semibold mb-1">
                      SYSTEM SECURED TARGET
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                      Computer Claimed 100
                    </h2>
                    <p className="text-dim text-xs sm:text-sm mt-1 max-w-md">
                      The opponent seized the critical terminal multiple. Sharpen your next approach.
                    </p>
                  </>
                )}
              </div>

              {/* Game Stats Card with Local Record */}
              <div className="max-w-md mx-auto my-5 p-3.5 rounded-xl border border-edge bg-bg/50">
                <div className="grid grid-cols-3 gap-2.5 pb-2.5 border-b border-edge/60">
                  <div>
                    <span className="block font-mono text-[9px] text-dim uppercase">FINAL SUM</span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-accent">100</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] text-dim uppercase">DIFFICULTY</span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-fg uppercase">
                      {difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] text-dim uppercase">OUTCOME</span>
                    <span
                      className={[
                        'font-mono text-xs sm:text-sm font-semibold uppercase',
                        outcome === 'win' ? 'text-emerald-400' : 'text-accent',
                      ].join(' ')}
                    >
                      {outcome === 'win' ? 'PLAYER' : 'SYSTEM'}
                    </span>
                  </div>
                </div>

                {/* Browser Statistics (localStorage) */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-dim">
                  <span className="uppercase text-[9.5px] tracking-wider text-dim/80">Local Browser Record</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-medium">Wins: {browserStats.wins}</span>
                    <span className="text-accent font-medium">Losses: {browserStats.losses}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Play Again & Change Difficulty */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-h text-white font-medium text-[13px] px-5 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/20"
                >
                  <span>Play Again</span>
                  <span className="font-mono">↺</span>
                </button>

                <button
                  type="button"
                  onClick={handleChangeDifficulty}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-dim hover:text-fg border border-edge hover:border-accent/60 font-medium text-[13px] px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer bg-surface/60"
                >
                  <span>Change Difficulty</span>
                </button>

                <a
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-dim hover:text-fg border border-edge hover:border-edge/90 font-medium text-[13px] px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer bg-bg/50"
                >
                  <span>Back to RILBIEZ</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
