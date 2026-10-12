import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';
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
  const [mounted, setMounted] = useState(false);
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

  // Trigger smooth entrance animation on mount and load stats
  useEffect(() => {
    setMounted(true);
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
      if (activeGeneration !== generationRef.current) {
        return;
      }

      const totalAtTurn = currentNumberRef.current;
      if (totalAtTurn >= TARGET_TOTAL) {
        return;
      }

      const botMove = getBotMove(
        difficultyRef.current,
        totalAtTurn,
        lastPlayerMoveRef.current
      );

      const nextTotal = totalAtTurn + botMove;
      setCurrentNumber(nextTotal);
      currentNumberRef.current = nextTotal;
      setIsBotThinking(false);

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

  const difficultyDetails: Record<Difficulty, { label: string; desc: string }> = {
    easy: {
      label: 'Easy',
      desc: 'Casual & relaxed. Great for warming up.',
    },
    medium: {
      label: 'Medium',
      desc: 'Balanced. The computer plays smart moves.',
    },
    hard: {
      label: 'Hard',
      desc: 'Flawless strategy. Punishes any misstep.',
    },
  };

  const lastMove = movesHistoryRef.current[movesHistoryRef.current.length - 1];

  return (
    <div className="relative min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-white flex flex-col font-sans">
      <Head title="Brain Challenge" />

      {/* Background Motion Layer */}
      <BackgroundMotion />

      {/* Top Header - Matching Homepage Navbar with Logo + Brand */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-edge/80 bg-[#090A0F]/85 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 md:px-12 h-16 md:h-[70px] flex items-center justify-between">
          {/* Logo + RILBIEZ - clicking returns to homepage */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-fg hover:text-accent transition-colors duration-200 group cursor-pointer"
            aria-label="RILBIEZ"
          >
            <img
              src="/images/Rilbiez_logo_transparan.png"
              alt="Rilbiez"
              className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(200,77,22,0.4)] group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-semibold tracking-[0.2em] text-[13.5px]">RILBIEZ</span>
          </Link>

          {/* Right Header: Clean subtle indicator & stats */}
          <div className="flex items-center gap-3">
            
            {(browserStats.wins > 0 || browserStats.losses > 0) && (
              <div className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-dim border border-edge/60 px-2.5 py-1 rounded-md">
                <span className="text-emerald-400 font-medium">{browserStats.wins} Win</span>
                <span>/</span>
                <span className="text-red-600" >{browserStats.losses} Loss</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Native body layout without heavy card boxing */}
      <main className="relative z-10 flex-1 flex flex-col pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div
          className={[
            'max-w-[1000px] w-full mx-auto px-6 sm:px-8 md:px-10 flex-1 flex flex-col justify-center transition-all duration-700 ease-out',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          ].join(' ')}
        >
          {/* =========================================================================
              VIEW 1: INTRODUCTION & SETUP (gameState === 'intro')
             ========================================================================= */}
          {gameState === 'intro' && (
            <div className="py-2 sm:py-6">
              {/* Section Tag */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6 select-none">
                <span className="block w-6 h-px bg-accent flex-shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.16em] text-accent uppercase font-medium">
                  Brain Challenge
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-fg mb-4">
                Target 100
              </h1>
              <p className="text-dim text-sm sm:text-base md:text-[17px] leading-relaxed max-w-2xl mb-8 sm:mb-10">
                A simple turn-based numbers duel. Take turns adding any integer from{' '}
                <span className="text-fg font-mono font-medium">+1</span> to{' '}
                <span className="text-fg font-mono font-medium">+10</span> to a shared running count.
                The first to reach exactly <span className="text-accent font-mono font-bold">100</span> wins.
              </p>

              {/* How it works: 3 Clean Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-8 sm:mb-10">
                <div className="border border-edge/70 bg-surface/30 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
                  <span className="font-mono text-[11px] text-accent font-semibold tracking-wider uppercase block mb-1.5">
                    01. Pick a number
                  </span>
                  <p className="text-xs sm:text-[13px] text-dim leading-relaxed">
                    Choose any number from +1 to +10 on your turn to increase the count.
                  </p>
                </div>
                <div className="border border-edge/70 bg-surface/30 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
                  <span className="font-mono text-[11px] text-accent font-semibold tracking-wider uppercase block mb-1.5">
                    02. Take turns
                  </span>
                  <p className="text-xs sm:text-[13px] text-dim leading-relaxed">
                    The computer answers with its move. Think ahead to control the pace.
                  </p>
                </div>
                <div className="border border-edge/70 bg-surface/30 rounded-xl p-4 sm:p-5 backdrop-blur-xs">
                  <span className="font-mono text-[11px] text-accent font-semibold tracking-wider uppercase block mb-1.5">
                    03. Reach 100
                  </span>
                  <p className="text-xs sm:text-[13px] text-dim leading-relaxed">
                    The player who lands on exactly 100 claims victory.
                  </p>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8 sm:mb-10">
                <span className="block font-mono text-[10.5px] sm:text-[11px] tracking-widest text-dim uppercase mb-3">
                  Select Difficulty
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                    const meta = difficultyDetails[d];
                    const isSelected = difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={[
                          'text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[92px]',
                          isSelected
                            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10 ring-1 ring-accent'
                            : 'border-edge/70 bg-surface/30 hover:border-edge hover:bg-surface/60',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-fg text-sm tracking-wide">{meta.label}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="text-xs text-dim leading-relaxed">{meta.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Challenge Button */}
              <div>
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-h text-white font-medium text-sm sm:text-[15px] px-8 py-3.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/25"
                >
                  <span>Start Game</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: ACTIVE GAME ARENA (gameState === 'playing')
             ========================================================================= */}
          {gameState === 'playing' && (
            <div className="py-2 sm:py-6">
              {/* Arena Status Bar: Difficulty & Turn Indicator */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-edge/70">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-dim uppercase tracking-wider">Difficulty:</span>
                  <span className="font-mono text-xs text-fg font-semibold uppercase px-2.5 py-0.5 rounded border border-edge bg-surface/50">
                    {difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeDifficulty}
                    className="text-xs font-mono text-dim hover:text-accent transition-colors ml-1 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Turn Indicator */}
                <div className="flex items-center gap-2">
                  {currentTurn === 'you' ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Your Turn
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      {isBotThinking ? 'Computer is thinking...' : "Computer's turn"}
                    </div>
                  )}
                </div>
              </div>

              {/* Running Total Display */}
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xs tracking-widest text-dim uppercase mb-2">
                  Current Total
                </span>

                <div className="relative flex items-baseline justify-center my-1">
                  <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-fg drop-shadow-[0_0_30px_rgba(200,77,22,0.15)]">
                    {currentNumber}
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl text-dim/40 ml-2">/ 100</span>
                </div>

                {/* Last move feedback */}
                {lastMove && (
                  <p className="text-xs sm:text-sm font-mono text-dim mt-3">
                    {lastMove.actor === 'you' ? (
                      <span>You added <strong className="text-emerald-400 font-semibold">+{lastMove.added_number}</strong></span>
                    ) : (
                      <span>Computer added <strong className="text-indigo-400 font-semibold">+{lastMove.added_number}</strong></span>
                    )}
                  </p>
                )}

                {/* Smooth Progress Bar */}
                <div className="w-full max-w-md mt-6">
                  <div className="w-full h-2 bg-edge/60 rounded-full overflow-hidden p-0.5 border border-edge/40">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-h rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, currentNumber)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-dim mt-2">
                    <span>0</span>
                    <span>{100 - currentNumber > 0 ? `${100 - currentNumber} to reach 100` : 'Goal achieved'}</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Number Addition Keypad */}
              <div className="pt-6 border-t border-edge/70">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-dim uppercase tracking-wider">
                    Select your addition (+1 to +10)
                  </span>
                  <span className="font-mono text-xs text-dim">
                    {currentTurn === 'you' && !isBotThinking ? 'Your move' : 'Waiting for computer'}
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
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
                          'py-3 sm:py-4 rounded-xl font-mono text-sm sm:text-base font-bold border transition-all duration-200 flex flex-col items-center justify-center select-none',
                          isDisabled
                            ? 'opacity-30 border-edge/30 bg-surface/10 text-dim cursor-not-allowed'
                            : 'cursor-pointer border-edge bg-surface/60 text-fg hover:border-accent hover:text-accent hover:bg-accent/10 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
                        ].join(' ')}
                      >
                        +{num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: RESULT STATE (gameState === 'result')
             ========================================================================= */}
          {gameState === 'result' && (
            <div className="py-6 sm:py-10 flex flex-col items-center text-center max-w-xl mx-auto">
              {outcome === 'win' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-2xl mb-4 shadow-lg shadow-emerald-500/10">
                    ★
                  </div>
                  <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-semibold mb-1">
                    Victory
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fg mb-2">
                    You Reached 100!
                  </h2>
                  <p className="text-dim text-sm sm:text-base max-w-md mb-8">
                    Well calculated! You landed exactly on 100 before the computer.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent font-mono text-2xl mb-4 shadow-lg shadow-accent/10">
                    ✕
                  </div>
                  <span className="font-mono text-xs tracking-widest text-accent uppercase font-semibold mb-1">
                    Round Over
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-fg mb-2">
                    Computer Reached 100
                  </h2>
                  <p className="text-dim text-sm sm:text-base max-w-md mb-8">
                    The computer landed on 100 first. Ready to try again?
                  </p>
                </>
              )}

              {/* Summary Stats Box */}
              <div className="w-full p-4 sm:p-5 rounded-xl border border-edge/80 bg-surface/40 backdrop-blur-xs mb-8">
                <div className="grid grid-cols-3 gap-4 pb-4 border-b border-edge/60 text-center">
                  <div>
                    <span className="block font-mono text-[10px] text-dim uppercase">Total Moves</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-fg">
                      {movesHistoryRef.current.length}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-dim uppercase">Difficulty</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-fg capitalize">
                      {difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-dim uppercase">Outcome</span>
                    <span
                      className={[
                        'font-mono text-base sm:text-lg font-bold',
                        outcome === 'win' ? 'text-emerald-400' : 'text-accent',
                      ].join(' ')}
                    >
                      {outcome === 'win' ? 'Win' : 'Loss'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-mono text-dim">
                  <span>Your Record</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold">{browserStats.wins} Wins</span>
                    <span className="text-accent font-semibold">{browserStats.losses} Losses</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-h text-white font-medium text-sm px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/20"
                >
                  <span>Play Again</span>
                  <span className="font-mono">↺</span>
                </button>
                <button
                  type="button"
                  onClick={handleChangeDifficulty}
                  className="inline-flex items-center gap-2 text-dim hover:text-fg border border-edge hover:border-accent/60 font-medium text-sm px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer bg-surface/40"
                >
                  <span>Change Difficulty</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-dim hover:text-fg border border-edge/60 hover:border-edge font-medium text-sm px-5 py-3 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
