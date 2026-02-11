import { useEffect, useState, useRef } from 'react';
import { useGameEngine } from './engine/useGameEngine';
import { TypingArea } from './components/TypingArea';
import { GlitchMeter } from './components/GlitchMeter';
import Mascot, { Mood } from './components/Mascot';
import RoamingMascots from './components/RoamingMascots';
import SettingsModal from './components/SettingsModal';
import SettingsIcon from './components/SettingsIcon';
import { PopBadge } from './components/PopBadge';
import { playSound, speak } from './engine/sound';
import confetti from 'canvas-confetti';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [isMuted] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const [popBadges, setPopBadges] = useState<{ id: number; text: string; type: any; x: number; y: number }[]>([]);
    const badgeIdRef = useRef(0);

    // App-wide settings
    const [settings, setSettings] = useState({
        music: true,
        shake: true,
        vibrate: true,
        soundFX: true
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const MUSIC_URL = '/assets/audio/mochamusic-candy-clouds-405666.mp3';

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
        onPlaySound: (type) => settings.soundFX && playSound(type)
    });

    const [hasInteracted, setHasInteracted] = useState(false);

    const startMusicFadeIn = (audio: HTMLAudioElement) => {
        // Only start if not already playing or has reached target volume
        if (!audio.paused && audio.volume > 0) return;

        audio.play().then(() => {
            audio.volume = 0;
            const fadeDuration = 3000;
            const targetVolume = 0.45;
            const start = performance.now();
            const fade = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / fadeDuration, 1);
                audio.volume = progress * targetVolume;
                if (progress < 1 && !audio.paused) {
                    requestAnimationFrame(fade);
                }
            };
            requestAnimationFrame(fade);
        }).catch(() => {
            // Autoplay blocked - will be handled by 'resume' listener
            console.log("Autoplay blocked, waiting for interaction.");
        });
    };

    // Handle initial mute state and user interaction for audio
    useEffect(() => {
        import('./engine/sound').then(({ setMuted, cancelSpeech, resumeAudio }) => {
            setMuted(isMuted);
            if (isMuted) cancelSpeech();

            const resume = () => {
                resumeAudio();
                setHasInteracted(true);
                if (settings.music && !isMuted && audioRef.current && (audioRef.current.paused || audioRef.current.volume === 0)) {
                    startMusicFadeIn(audioRef.current);
                }
                window.removeEventListener('click', resume);
                window.removeEventListener('keydown', resume);
            };
            window.addEventListener('click', resume);
            window.addEventListener('keydown', resume);
        });
    }, [isMuted, settings.music]);

    // Handle settings changes
    const handleSettingsChange = (key: string, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Background music control
    useEffect(() => {
        if (!audioRef.current) {
            try {
                audioRef.current = new Audio(MUSIC_URL);
                audioRef.current.loop = true;
                audioRef.current.volume = 0;
                audioRef.current.preload = 'auto';
            } catch (e) {
                audioRef.current = null;
            }
        }

        const audio = audioRef.current;
        if (!audio) return;

        if (settings.music && !isMuted) {
            // Attempt playback immediately (may be blocked by browser)
            startMusicFadeIn(audio);
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
        }
    }, [settings.music, isMuted]);

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

    // Mascot Mood Logic
    const mood: Mood = gameState === 'victory' ? 'victory' :
        gameState === 'crashed' ? 'dizzy' :
            phase === 'FIRE' ? 'stressed' :
                combo > 20 ? 'happy' : 'idle';

    // Spawn PopBadge on score/combo change
    const lastScore = useRef(score);
    useEffect(() => {
        if (score > lastScore.current && gameState === 'playing') {
            const diff = score - lastScore.current;
            const id = ++badgeIdRef.current;
            setPopBadges(prev => [...prev, {
                id,
                text: `+${diff}`,
                type: 'score',
                x: window.innerWidth / 2 + (Math.random() * 100 - 50),
                y: window.innerHeight / 2 + (Math.random() * 40 - 20)
            }]);
            lastScore.current = score;
        }
    }, [score, gameState]);

    const lastCombo = useRef(combo);
    useEffect(() => {
        if (combo > lastCombo.current && combo > 0) {
            if (combo % 5 === 0) {
                const id = ++badgeIdRef.current;
                setPopBadges(prev => [...prev, {
                    id,
                    text: `${combo} COMBO!`,
                    type: 'combo',
                    x: window.innerWidth / 2 + (Math.random() * 80 - 40),
                    y: window.innerHeight / 2 - 80
                }]);
            }
        }
        lastCombo.current = combo;
    }, [combo]);

    // Mobile Keyboard Focus
    useEffect(() => {
        if (gameState === 'playing' && hiddenInputRef.current) {
            hiddenInputRef.current.focus();
            const handleFocus = () => {
                if (hiddenInputRef.current) hiddenInputRef.current.style.fontSize = '16px';
            };
            hiddenInputRef.current.addEventListener('focus', handleFocus);
            return () => hiddenInputRef.current?.removeEventListener('focus', handleFocus);
        }
    }, [gameState]);

    // Announcers & Confetti
    useEffect(() => {
        if (combo === 0 || isMuted) return;
        if (combo % 50 === 0) {
            speak("Unstoppable!");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else if (combo % 30 === 0) speak("Excellent!");
        else if (combo % 20 === 0) speak("Great!");
        else if (combo % 10 === 0) speak("Good!");
    }, [combo, isMuted]);

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

    useEffect(() => {
        if (phase !== lastPhase) {
            if (phase === 'FIRE' && !isMuted) speak("Critical Warning");
            if (phase === 'WATER' && !isMuted) speak("System Unstable");
            setLastPhase(phase);
        }
    }, [phase, lastPhase, isMuted]);

    useEffect(() => {
        if (gameState === 'victory') {
            const end = Date.now() + 5000;
            const frame = () => {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00ffff', '#ff00ff'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00ffff', '#ff00ff'] });
                if (Date.now() < end) requestAnimationFrame(frame);
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

            {/* Background */}
            <RoamingMascots />
            <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_4px,3px_100%] opacity-20" />

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
                        <div className="w-16 h-16 border-4 border-candy-mint border-t-transparent rounded-full animate-spin mb-4" />
                        <div className="text-candy-mint font-bold animate-pulse tracking-widest">FETCHING_DATA_NODES...</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD */}
            <div className="fixed top-2 left-2 right-2 md:top-6 md:left-12 md:right-12 z-40 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 pointer-events-auto">
                    <div className="hud-badge py-1 px-3 md:py-2 md:px-4">
                        <span className="badge-icon">💎</span>
                        <span className="score-level-font text-sm md:text-lg">{score.toLocaleString()}</span>
                    </div>
                    <div className={clsx("hud-badge py-1 px-3 md:py-2 md:px-4", isLevelStarted && "level-up")}>
                        <span className="badge-icon">⭐</span>
                        <span className="score-level-font text-sm md:text-lg">Lv {level}</span>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-center">
                    <h1 className="hero-title">GLITCH TYPER</h1>
                    <div className={clsx("hud-badge px-4 text-xs mt-2", phase === 'FIRE' && "fire-zone")}>PHASE: {phase}</div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-end md:items-center pointer-events-auto">
                    <div className="flex gap-2">
                        <div className="hud-badge py-1 px-3 md:py-2 md:px-4">
                            <span className="badge-icon">❤️</span>
                            <span className="score-level-font text-sm md:text-lg">{lives}</span>
                        </div>
                        <div className={clsx("hud-badge py-1 px-3 md:py-2 md:px-4", combo > 20 && "ring-2 ring-candy-pink")}>
                            <span className="badge-icon">🔥</span>
                            <span className="score-level-font text-sm md:text-lg">x{combo}</span>
                        </div>
                    </div>
                    <motion.button
                        onClick={() => setIsSettingsOpen(true)}
                        className="settings-button-poppy w-10 h-10 md:w-14 md:h-14"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <SettingsIcon isOpen={isSettingsOpen} />
                    </motion.button>
                </div>
            </div>

            {/* Mobile Title */}
            <div className="md:hidden absolute top-20 text-center z-30 w-full pointer-events-none">
                <h1 className="hero-title text-4xl">GLITCH TYPER</h1>
            </div>

            {/* Main Game Area */}
            <div className="playfield-container mt-24 md:mt-24 w-full max-w-3xl flex flex-col gap-8 items-center z-10">
                <div className="flex items-center gap-6 w-full px-4">
                    <Mascot size={80} mood={mood} variant="lollipop" />
                    <GlitchMeter value={glitchMeter} />
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center p-8 bg-white/5 rounded-3xl backdrop-blur-md">
                            <p className="text-2xl text-candy-mint mb-6 font-bold">READY TO TYP_?</p>
                            <button onClick={startGame} className="px-12 py-4 bg-candy-mint text-white font-black rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xl">
                                [ PRESS ENTER ]
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                            <TypingArea words={fullText} currentIndex={wordIndex} currentInput={currentInput} getDisplayWord={getDisplayWord} wordTimer={wordTimer} level={level} isLevelStarted={isLevelStarted} showSpaceWarning={showSpaceWarning} rotation={rotation} />
                        </motion.div>
                    )}

                    {gameState === 'crashed' && (
                        <motion.div key="crashed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-black/80 rounded-[40px] border-4 border-red-500 shadow-2xl backdrop-blur-xl">
                            <div className="text-5xl font-black text-red-500 mb-6">SYSTEM_CRASH</div>
                            <div className="text-6xl font-black text-white mb-8">{score.toLocaleString()}</div>
                            <button onClick={startGame} className="px-10 py-4 bg-red-600 text-white font-black rounded-xl text-xl hover:bg-red-500 transition-all">TRY AGAIN</button>
                        </motion.div>
                    )}

                    {gameState === 'victory' && (
                        <motion.div key="victory" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-16 bg-gradient-to-br from-candy-mint/90 to-candy-pink/90 rounded-[50px] shadow-[0_0_100px_rgba(122,246,217,0.5)] border-4 border-white backdrop-blur-2xl">
                            <h2 className="text-6xl font-black text-white mb-4 drop-shadow-lg">VICTORY_!</h2>
                            <p className="text-xl text-white/90 mb-10 font-bold">Glitch cleared. System Pure.</p>
                            <div className="text-7xl font-black text-white mb-10">{score.toLocaleString()}</div>
                            <button onClick={startGame} className="px-12 py-5 bg-white text-candy-pink font-black rounded-3xl text-2xl shadow-xl hover:scale-110 transition-transform">PLAY AGAIN</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pop Badges */}
            <AnimatePresence>
                {popBadges.map(badge => (
                    <PopBadge key={badge.id} {...badge} onComplete={() => setPopBadges(prev => prev.filter(b => b.id !== badge.id))} />
                ))}
            </AnimatePresence>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSettingsChange={handleSettingsChange} />

            <input ref={hiddenInputRef} type="text" inputMode="text" autoComplete="off" spellCheck="false" className="fixed -bottom-full opacity-0 pointer-events-none"
                onInput={(e) => { const val = (e.target as HTMLInputElement).value; if (val) { handleInput(val.slice(-1)); (e.target as HTMLInputElement).value = ''; } }}
                onKeyDown={(e) => { if (e.key === 'Backspace') { handleInput('Backspace'); (e.target as HTMLInputElement).value = ''; } }} />
        </div>
    );
}

export default App;
