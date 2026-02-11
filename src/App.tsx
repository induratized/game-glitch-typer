import { useEffect, useState, useRef } from 'react';
import { useGameEngine } from './engine/useGameEngine';
import { TypingArea } from './components/TypingArea';
import { GlitchMeter } from './components/GlitchMeter';
import { playSound, speak } from './engine/sound';
import confetti from 'canvas-confetti';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [isMuted, setIsMuted] = useState(false);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    
    const {
        gameState,
        startGame,
        handleInput,
        fullText,
        wordIndex,
        currentInput,
        wordTimer,
        score,
        combo,
        glitchMeter,
        level,
        getDisplayWord,
        lives,
        isLevelStarted,
        showSpaceWarning,
        isLoading,
        rotation
    } = useGameEngine({
        initialLevel: 1,
        onPlaySound: (type) => !isMuted && playSound(type)
    });

    // Handle initial mute state for speech and audio
    useEffect(() => {
        import('./engine/sound').then(({ setMuted, cancelSpeech }) => {
            setMuted(isMuted);
            if (isMuted) cancelSpeech();
        });
    }, [isMuted]);

    // Derived Phase
    const phase = glitchMeter > 66 ? 'FIRE' : glitchMeter > 33 ? 'WATER' : 'ICE';
    const [lastPhase, setLastPhase] = useState(phase);

    // Global Keyboard Listener
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (gameState === 'playing') {
                if (e.key.length === 1 || e.key === 'Backspace') {
                    e.preventDefault();
                    handleInput(e.key);
                }
            } else if (e.key === 'Enter' && (gameState === 'idle' || gameState === 'crashed' || gameState === 'victory')) {
                e.preventDefault();
                startGame();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, handleInput, startGame]);

    // Mobile Keyboard Focus Management
    // Keep hidden input focused during gameplay to trigger mobile keyboard
    useEffect(() => {
        if (gameState === 'playing' && hiddenInputRef.current) {
            hiddenInputRef.current.focus();
            // Prevent viewport zoom on iOS when focusing input
            const handleFocus = () => {
                if (hiddenInputRef.current) {
                    hiddenInputRef.current.style.fontSize = '16px';
                }
            };
            hiddenInputRef.current.addEventListener('focus', handleFocus);
            return () => hiddenInputRef.current?.removeEventListener('focus', handleFocus);
        }
    }, [gameState]);

    // Combo Announcer & FX
    useEffect(() => {
        if (combo === 0 || isMuted) return;

        if (combo % 50 === 0) {
            speak("Unstoppable!");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else if (combo % 30 === 0) {
            speak("Excellent!");
        } else if (combo % 20 === 0) {
            speak("Great!");
        } else if (combo % 10 === 0) {
            speak("Good!");
        }
    }, [combo, isMuted]);

    // Level Up Announcer
    const lastAnnouncedLevel = useRef(0);
    useEffect(() => {
        if (level > 1 && level !== lastAnnouncedLevel.current) {
            if (!isMuted) {
                speak(`Level ${level}`);
                confetti({ particleCount: 50, spread: 60 });
            }
            lastAnnouncedLevel.current = level;
        }
    }, [level, isMuted]);

    // Phase Transition Announcer
    useEffect(() => {
        if (phase !== lastPhase) {
            if (phase === 'FIRE' && !isMuted) speak("Critical Warning");
            if (phase === 'WATER' && !isMuted) speak("System Unstable");
            setLastPhase(phase);
        }
    }, [phase, lastPhase, isMuted]);

    // Victory Confetti
    useEffect(() => {
        if (gameState === 'victory') {
            const duration = 5000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#00ffff', '#ff00ff']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#00ffff', '#ff00ff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
            if (!isMuted) speak("Mission Accomplished");
        }
    }, [gameState, isMuted]);

    return (
        <div className={clsx(
            "min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-1000 relative overflow-hidden app-playful",
            phase === 'FIRE' ? "bg-red-950" : phase === 'WATER' ? "bg-slate-900" : "bg-slate-950"
        )}>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md"
                    >
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <div className="text-cyan-400 font-mono animate-pulse tracking-widest">FETCHING_DATA_NODES...</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center gap-4 z-40 flex-wrap">
                {/* Score & Level Badges */}
                <div className="flex gap-3 items-center">
                    <div className="hud-badge">
                        <span className="badge-icon">💎</span>
                        <span className="score-level-font">{score.toLocaleString()}</span>
                    </div>
                    <div className={clsx("hud-badge", level > 1 && "level-up")}>
                        <span className="badge-icon">⭐</span>
                        <span className="score-level-font">Lv {level}</span>
                    </div>
                </div>

                {/* Title (Center) */}
                <h1 className="hero-title flex-1 text-center">
                    GLITCH TYPER
                </h1>

                {/* Lives & Combo (Right) */}
                <div className="flex gap-3 items-center">
                    <div className="hud-badge">
                        <span className="badge-icon">❤️</span>
                        <span className="score-level-font">{lives}</span>
                    </div>
                    <div className={clsx(
                        "hud-badge transition-all",
                        combo > 20 && "ring-2 ring-purple-400"
                    )}>
                        <span className="badge-icon">🔥</span>
                        <span className="score-level-font">x{combo}</span>
                    </div>
                </div>
            </div>

            {/* Phase Indicator Badge */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30">
                <div className={clsx(
                    "hud-badge px-6 text-sm font-bold tracking-wider transition-all",
                    phase === 'FIRE' && "fire-zone",
                    phase === 'FIRE' ? "ring-2 ring-red-500" : ""
                )}>
                    PHASE: <span className={clsx(
                        "font-black",
                        phase === 'FIRE' ? "text-red-400" : phase === 'WATER' ? "text-blue-400" : "text-cyan-300"
                    )}>{phase}</span>
                </div>
            </div>

            {/* Mute Toggle */}
            <button
                onClick={() => setIsMuted(p => !p)}
                aria-label="Toggle Mute"
                className="absolute top-6 right-6 text-cyan-500 hover:text-white z-50 p-2 transition-colors"
            >
                {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Main Game Area */}
            <div className="playfield-container mt-32 w-full max-w-2xl flex flex-col gap-8 items-center z-10">

                {/* Meter */}
                <GlitchMeter value={glitchMeter} />

                {/* Content */}
                {gameState === 'idle' && (
                    <div className="text-center animate-pulse">
                        <p className="text-2xl text-cyan-300 mb-4">INITIALIZE PROTOCOL_ZERO</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all transform hover:scale-105"
                        >
                            [ PRESS ENTER TO START ]
                        </button>
                        <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
                            <p>Type the words before the timer runs out.</p>
                            <p>Mistakes increase <span className="text-red-400">SYSTEM INSTABILITY</span>.</p>
                            <p>You have 3 Lives. Good luck.</p>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <TypingArea
                        words={fullText}
                        currentIndex={wordIndex}
                        currentInput={currentInput}
                        getDisplayWord={getDisplayWord}
                        wordTimer={wordTimer}
                        level={level}
                        isLevelStarted={isLevelStarted}
                        showSpaceWarning={showSpaceWarning}
                        rotation={rotation}
                    />
                )}

                {gameState === 'crashed' && (
                    <div className="text-center relative bg-black/80 p-12 rounded-xl border border-red-500/50 backdrop-blur-lg">
                        <div className="text-6xl font-black text-red-600 mb-4 animate-bounce">SYSTEM FATAL ERROR</div>
                        <div className="text-2xl text-white mb-8">CONNECTION TERMINATED</div>

                        <div className="grid grid-cols-2 gap-8 text-right mb-8 text-xl font-mono">
                            <div className="text-gray-400">FINAL SCORE:</div>
                            <div className="text-cyan-400">{score.toLocaleString()}</div>
                            <div className="text-gray-400">LEVEL REACHED:</div>
                            <div className="text-cyan-400">{level}</div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                        >
                            [ REBOOT SYSTEM ]
                        </button>
                    </div>
                )}

                {gameState === 'victory' && (
                    <div className="text-center relative bg-black/60 p-16 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-xl shadow-[0_0_100px_rgba(34,211,238,0.3)]">
                        <h2 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6 animate-pulse">
                            MISSION ACCOMPLISHED
                        </h2>
                        <div className="text-2xl text-white mb-10">System Stabilized. Glitch Eradicated.</div>

                        <div className="bg-white/5 p-8 rounded-lg mb-10 max-w-md mx-auto">
                            <div className="grid grid-cols-2 gap-4 text-left text-xl font-mono">
                                <div className="text-cyan-300">TOTAL SCORE</div>
                                <div className="text-right text-white font-bold">{score.toLocaleString()}</div>

                                <div className="text-cyan-300">MAX COMBO</div>
                                <div className="text-right text-white font-bold">x{/* Max combo not tracked separately, but current is close */} {combo}</div>

                                <div className="text-cyan-300">LIVES REMAINING</div>
                                <div className="text-right text-red-400 font-bold">{lives}/3</div>
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all"
                        >
                            [ PLAY AGAIN ]
                        </button>
                    </div>
                )}
            </div>

            {/* Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_4px,3px_100%] opacity-20" />

            {/* Phase Transition Overlay */}
            <AnimatePresence>
                {(phase !== lastPhase) && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100]"
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 1, 2],
                            rotate: [0, 0, 0, 15]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "backOut" }}
                    >
                        <div className={clsx(
                            "text-9xl font-black tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]",
                            phase === 'FIRE' ? "text-red-500" : phase === 'WATER' ? "text-blue-500" : "text-cyan-100"
                        )}>
                            {phase} PHASE
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase Flash Effect */}
            <AnimatePresence>
                {phase !== lastPhase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={clsx(
                            "fixed inset-0 pointer-events-none z-[90]",
                            phase === 'FIRE' ? "bg-red-500" : phase === 'WATER' ? "bg-blue-500" : "bg-cyan-500"
                        )}
                    />
                )}
            </AnimatePresence>

            {/* Hidden Input for Mobile Keyboard (always accessible) */}
            <input
                ref={hiddenInputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
                className="fixed -bottom-full opacity-0 pointer-events-none text-base"
                onInput={(e) => {
                    const char = (e.target as HTMLInputElement).value.slice(-1);
                    if (char) {
                        handleInput(char);
                        (e.target as HTMLInputElement).value = '';
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                        e.preventDefault();
                        handleInput('Backspace');
                        (e.target as HTMLInputElement).value = '';
                    }
                }}
            />
        </div>
    );
}

export default App;
