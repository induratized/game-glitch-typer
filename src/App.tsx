import { useEffect, useState, useRef } from 'react';
import { useGameEngine } from './engine/useGameEngine';
import { TypingArea } from './components/TypingArea';
import { GlitchMeter } from './components/GlitchMeter';
import Mascot, { Mood } from './components/Mascot';
import RoamingMascots from './components/RoamingMascots';
import SettingsModal from './components/SettingsModal';
import SettingsIcon from './components/SettingsIcon';
import { PopBadge } from './components/PopBadge';
import { playSound, speak, resumeAudio, setMuted, cancelSpeech } from './engine/sound';
import confetti from 'canvas-confetti';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 3L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15V14H9V21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z"
            stroke="#FFF4DD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
    </svg>
);

const RestartIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.49 15L19 19H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.51 9C4.517 7.053 6.139 5.437 8.114 4.41C10.089 3.383 12.339 3 14.506 3.31C16.673 3.62 18.665 4.61 20.165 6.12L23 9M1 15L3.835 17.88C5.335 19.39 7.327 20.38 9.494 20.69C11.661 21 13.911 20.617 15.886 19.59C17.861 18.563 19.483 16.947 20.49 15"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CandyModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 p-8 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] max-w-sm w-full text-center backdrop-blur-xl">
                    <h3 className="text-3xl font-black text-white mb-4 score-level-font">{title}</h3>
                    <p className="text-white/80 mb-8 font-medium">{message}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={onCancel} className="px-6 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Cancel</button>
                        <button onClick={onConfirm} className="px-6 py-3 bg-candy-pink text-white font-bold rounded-2xl shadow-lg shadow-candy-pink/30 hover:scale-105 transition-all">Confirm</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

function App() {
    const [isMuted] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const [popBadges, setPopBadges] = useState<{ id: number; text: string; type: any; x: number; y: number }[]>([]);
    const badgeIdRef = useRef(0);
    const [bubblePosition, setBubblePosition] = useState({ top: '50%', left: '50%' });

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
        rotation,
        resetToHome,
        restartLevel
    } = useGameEngine({
        initialLevel: 1,
        onPlaySound: (type) => settings.soundFX && playSound(type)
    });

    const [hasInteracted, setHasInteracted] = useState(false);
    const [confirmHome, setConfirmHome] = useState(false);
    const [confirmRestart, setConfirmRestart] = useState(false);

    const isFadingRef = useRef(false);

    const startMusicFadeIn = (audio: HTMLAudioElement) => {
        console.log('[Audio Debug] startMusicFadeIn called', {
            musicEnabled: settings.music,
            isMuted,
            audioPaused: audio.paused,
            audioVolume: audio.volume,
            isFading: isFadingRef.current
        });

        // Stop if music is disabled or muted
        if (!settings.music || isMuted) {
            console.log('[Audio Debug] Music disabled or muted, skipping');
            return;
        }

        // If already playing and volume is good, no need to start again
        if (!audio.paused && audio.volume > 0.4 && !isFadingRef.current) {
            console.log('[Audio Debug] Already playing with good volume');
            return;
        }

        // If already fading, let it finish unless it's paused
        if (isFadingRef.current && !audio.paused) {
            console.log('[Audio Debug] Already fading');
            return;
        }

        console.log('[Audio Debug] Attempting to play audio');
        const playPromise = audio.play();

        const doFade = () => {
            if (isFadingRef.current) return;
            isFadingRef.current = true;

            audio.volume = 0;
            const fadeDuration = 3000;
            const targetVolume = 0.45;
            const start = performance.now();

            console.log('[Audio Debug] Starting fade animation');

            const fade = (now: number) => {
                // If music was paused or changed during fade, stop the animation
                if (audio.paused || !settings.music || isMuted) {
                    console.log('[Audio Debug] Fade stopped:', { paused: audio.paused, music: settings.music, muted: isMuted });
                    isFadingRef.current = false;
                    return;
                }

                const elapsed = now - start;
                const progress = Math.min(elapsed / fadeDuration, 1);
                audio.volume = progress * targetVolume;

                // Log every 500ms
                if (Math.floor(elapsed / 500) !== Math.floor((elapsed - 16) / 500)) {
                    console.log('[Audio Debug] Fade progress:', {
                        progress: (progress * 100).toFixed(1) + '%',
                        volume: audio.volume.toFixed(3),
                        paused: audio.paused
                    });
                }

                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else {
                    console.log('[Audio Debug] Fade complete, final volume:', audio.volume);
                    isFadingRef.current = false;
                }
            };
            requestAnimationFrame(fade);
        };

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('[Audio Debug] Audio play() succeeded');
                doFade();
            }).catch((error) => {
                console.error('[Audio Debug] Audio play() failed:', error);
                isFadingRef.current = false;
            });
        } else {
            doFade();
        }
    };

    // 1. Initialize Audio Instance (Once)
    useEffect(() => {
        if (!audioRef.current) {
            const audio = new Audio(MUSIC_URL);
            audio.loop = true;
            audio.volume = 0;
            audioRef.current = audio;
        }
    }, []);

    // 2. Audio State & Interaction Sync
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        setMuted(isMuted);
        if (isMuted) cancelSpeech();

        // Persistent focus handler for mobile keyboards
        const handleFocus = () => {
            // Only focus if playing and settings closed
            if (gameState === 'playing' && !isSettingsOpen && hiddenInputRef.current) {
                hiddenInputRef.current.focus({ preventScroll: true });
            }
        };
        window.addEventListener('click', handleFocus);
        window.addEventListener('touchstart', handleFocus);

        const handleInteraction = (event?: Event) => {
            console.log('[Audio Debug] User interaction detected, type:', event?.type);

            // If this is a keyboard event and we're playing, just set hasInteracted and let the keystroke pass through
            if (event?.type === 'keydown' && gameState === 'playing') {
                console.log('[Input Debug] Keyboard event during gameplay, setting hasInteracted but not consuming');
                if (!hasInteracted) {
                    resumeAudio();
                    setHasInteracted(true);
                }
                // Don't process music/audio here, let the keystroke reach the input
                return;
            }

            // CRITICAL: Play audio FIRST, before any state updates
            // This ensures audio.play() is called synchronously in the user gesture handler
            if (!hasInteracted && settings.music && !isMuted && audio.paused) {
                console.log('[Audio Debug] Starting music on first interaction (BEFORE state update)');
                startMusicFadeIn(audio);
            }

            if (!hasInteracted) {
                console.log('[Audio Debug] First interaction, resuming audio context');
                resumeAudio();
                setHasInteracted(true);
            } else if (settings.music && !isMuted && audio.paused) {
                console.log('[Audio Debug] Starting music fade-in');
                startMusicFadeIn(audio);
            } else {
                console.log('[Audio Debug] Music not started:', {
                    musicEnabled: settings.music,
                    isMuted,
                    audioPaused: audio.paused
                });
            }
        };

        // Attach listeners for global catch-all
        if (!hasInteracted) {
            const events = ['click', 'keydown', 'mousedown', 'touchstart'];
            events.forEach(e => window.addEventListener(e, handleInteraction, { once: true }));
            return () => {
                window.removeEventListener('click', handleFocus);
                window.removeEventListener('touchstart', handleFocus);
                events.forEach(e => window.removeEventListener(e, handleInteraction));
            };
        }

        // Handle settings-driven changes (when already interacted)
        if (hasInteracted && settings.music && !isMuted) {
            if (audio.paused && !isFadingRef.current) {
                console.log('[Audio Debug] Starting music from useEffect (settings changed)');
                startMusicFadeIn(audio);
            }
        } else if (hasInteracted) {
            audio.pause();
            isFadingRef.current = false;
        }

        return () => {
            window.removeEventListener('click', handleFocus);
            window.removeEventListener('touchstart', handleFocus);
        };
    }, [isMuted, settings.music, hasInteracted]);

    const handleStartGame = () => {
        resumeAudio();
        setHasInteracted(true);
        if (settings.music && !isMuted && audioRef.current && audioRef.current.paused) {
            startMusicFadeIn(audioRef.current);
        }
        startGame();

        // Focus the hidden input immediately when starting the game
        setTimeout(() => {
            if (hiddenInputRef.current) {
                console.log('[Focus Debug] Focusing input in handleStartGame');
                hiddenInputRef.current.focus();
            }
        }, 100);
    };

    // Handle settings changes
    const handleSettingsChange = (key: string, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Proactively resume/trigger if music is being enabled
        if (key === 'music' && value && !isMuted) {
            resumeAudio();
            setHasInteracted(true);
            if (audioRef.current && audioRef.current.paused) {
                startMusicFadeIn(audioRef.current);
            }
        }
    };

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
                handleStartGame();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [gameState, handleInput, handleStartGame]);

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
        console.log('[Focus Debug] useEffect triggered, gameState:', gameState, 'hasInteracted:', hasInteracted);
        if (gameState === 'playing' && hiddenInputRef.current) {
            console.log('[Focus Debug] Focusing hidden input');
            hiddenInputRef.current.focus();
            const handleFocus = () => {
                console.log('[Focus Debug] Input focused');
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

    // Calculate bubble position based on current word capsule
    useEffect(() => {
        if (showSpaceWarning && gameState === 'playing') {
            let rafId: number;
            const updatePosition = () => {
                const capsule = document.getElementById('current-word-capsule');
                if (capsule) {
                    const rect = capsule.getBoundingClientRect();
                    setBubblePosition({
                        top: `${rect.top - 60}px`,
                        left: `${rect.right + 12}px`
                    });
                }
            };

            const throttledUpdate = () => {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(updatePosition);
            };

            updatePosition();
            window.addEventListener('resize', throttledUpdate);
            window.addEventListener('scroll', throttledUpdate, true); // Capture scroll events too

            return () => {
                window.removeEventListener('resize', throttledUpdate);
                window.removeEventListener('scroll', throttledUpdate, true);
                cancelAnimationFrame(rafId);
            };
        }
    }, [showSpaceWarning, gameState, wordIndex]);

    return (
        <div className={clsx(
            "min-h-screen flex flex-col items-center p-4 transition-colors duration-1000 relative overflow-hidden app-playful",
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
            {/* Mobile HUD (Stats Only) */}
            <div className="md:hidden fixed top-4 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
                <div className="flex justify-center items-center gap-5 w-full px-4 pointer-events-auto">
                    <div className="hud-badge transform scale-150">
                        <span className="badge-icon">💎</span>
                        <span className="score-level-font text-sm">{score.toLocaleString()}</span>
                    </div>
                    <div className={clsx("hud-badge transform scale-150", isLevelStarted && "level-up")}>
                        <span className="badge-icon">🥇</span>
                        <span className="score-level-font text-sm">{level}</span>
                    </div>
                    <div className="hud-badge transform scale-150">
                        <span className="badge-icon">❤️</span>
                        <span className="score-level-font text-sm">{lives}</span>
                    </div>
                    <div className={clsx("hud-badge transform scale-150", combo > 20 && "ring-2 ring-candy-pink")}>
                        <span className="badge-icon">🔥</span>
                        <span className="score-level-font text-sm">x{combo}</span>
                    </div>
                </div>
                {phase === 'FIRE' && (
                    <div className="hud-badge inline-block px-4 text-xs mt-10 fire-zone pointer-events-auto">PHASE: {phase}</div>
                )}
            </div>

            {/* Desktop HUD */}
            <div className="hidden md:flex fixed top-6 left-12 right-12 z-40 justify-between items-start pointer-events-none">
                <div className="flex flex-row gap-3 pointer-events-auto">
                    <div className="hud-badge py-2 px-4">
                        <span className="badge-icon">💎</span>
                        <span className="score-level-font text-lg">{score.toLocaleString()}</span>
                    </div>
                    <div className={clsx("hud-badge py-2 px-4", isLevelStarted && "level-up")}>
                        <span className="badge-icon">⭐</span>
                        <span className="score-level-font text-lg">Lv {level}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className={clsx("hud-badge px-4 text-xs", phase === 'FIRE' && "fire-zone")}>PHASE: {phase}</div>
                </div>

                <div className="flex flex-row gap-3 items-center pointer-events-auto">
                    <div className="flex gap-2">
                        <div className="hud-badge py-2 px-4">
                            <span className="badge-icon">❤️</span>
                            <span className="score-level-font text-lg">{lives}</span>
                        </div>
                        <div className={clsx("hud-badge py-2 px-4", combo > 20 && "ring-2 ring-candy-pink")}>
                            <span className="badge-icon">🔥</span>
                            <span className="score-level-font text-lg">x{combo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Right Controls */}
            <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-3">
                {gameState !== 'idle' && (
                    <>
                        <motion.button
                            onClick={() => setConfirmHome(true)}
                            className="settings-button-poppy w-10 h-10 md:w-14 md:h-14 text-cream"
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.9 }}
                            title="Go to Home"
                        >
                            <HomeIcon />
                        </motion.button>
                        <motion.button
                            onClick={() => setConfirmRestart(true)}
                            className="settings-button-poppy w-10 h-10 md:w-14 md:h-14 text-white"
                            whileHover={{ scale: 1.1, rotate: -45 }}
                            whileTap={{ scale: 0.9 }}
                            title="Restart Level"
                        >
                            <RestartIcon />
                        </motion.button>
                    </>
                )}
                <motion.button
                    onClick={() => setIsSettingsOpen(true)}
                    className="settings-button-poppy w-12 h-12 md:w-16 md:h-16"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    title="Settings"
                >
                    <SettingsIcon isOpen={isSettingsOpen} />
                </motion.button>
            </div>

            {/* Main Game Area Container */}
            <div className="w-full flex flex-col items-center pt-[84px] px-4 z-10 gap-5">
                {/* Header (Normal Flow) */}
                <AnimatePresence>
                    {gameState === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center w-full px-5"
                        >
                            <h1 className="hero-title !text-[24vw] md:!text-[12vw] leading-[0.8] text-candy-mint drop-shadow-md">
                                GLITCH<br />TYPER
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Playfield Container */}
                <div className="playfield-container w-full max-w-3xl flex flex-col gap-8 items-center transition-all duration-700">
                    <div className="flex items-center justify-center w-full px-4">
                        {gameState !== 'playing' && <Mascot size={80} mood={mood} variant="lollipop" />}
                        {gameState === 'playing' && <GlitchMeter value={glitchMeter} />}
                    </div>

                    <AnimatePresence mode="wait">
                        {gameState === 'idle' && (
                            <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center p-8 bg-white/5 rounded-3xl backdrop-blur-md">
                                <p className="text-2xl text-candy-hot-pink mb-6 font-bold">READY TO TYP_?</p>
                                <button onClick={handleStartGame} className="px-12 py-4 bg-gem-emerald text-candy-cream font-black rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xl">
                                    [&nbsp;&nbsp;PRESS ENTER&nbsp;&nbsp;]
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'playing' && (
                            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <TypingArea words={fullText} currentIndex={wordIndex} currentInput={currentInput} getDisplayWord={getDisplayWord} wordTimer={wordTimer} level={level} isLevelStarted={isLevelStarted} rotation={rotation} />
                            </motion.div>
                        )}

                        {gameState === 'crashed' && (
                            <motion.div key="crashed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 bg-black/80 rounded-[40px] border-4 border-red-500 shadow-2xl backdrop-blur-xl">
                                <div className="text-5xl font-black text-red-500 mb-6">SYSTEM_CRASH</div>
                                <div className="text-6xl font-black text-white mb-8">{score.toLocaleString()}</div>
                                <button onClick={handleStartGame} className="px-10 py-4 bg-red-600 text-white font-black rounded-xl text-xl hover:bg-red-500 transition-all">TRY AGAIN</button>
                            </motion.div>
                        )}

                        {gameState === 'victory' && (
                            <motion.div key="victory" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-16 bg-gradient-to-br from-candy-mint/90 to-candy-pink/90 rounded-[50px] shadow-[0_0_100px_rgba(122,246,217,0.5)] border-4 border-white backdrop-blur-2xl">
                                <h2 className="text-6xl font-black text-white mb-4 drop-shadow-lg">VICTORY_!</h2>
                                <div className="text-8xl font-black text-white mb-8 score-level-font">{score.toLocaleString()}</div>
                                <button onClick={handleStartGame} className="px-12 py-5 bg-white text-candy-hot-pink font-black rounded-2xl text-2xl shadow-xl hover:scale-110 transition-all">NEXT_LEVEL</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pop Badges */}
                    <AnimatePresence>
                        {popBadges.map(badge => (
                            <PopBadge key={badge.id} {...badge} onComplete={() => setPopBadges(prev => prev.filter(b => b.id !== badge.id))} />
                        ))}
                    </AnimatePresence>

                    {/* Global Space Warning - Positioned Between Words */}
                    <AnimatePresence>
                        {showSpaceWarning && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                                className="speech-bubble"
                                style={{
                                    position: 'fixed',
                                    top: bubblePosition.top,
                                    left: bubblePosition.left,
                                    transform: 'translateX(-50%)',
                                    zIndex: 10000,
                                    pointerEvents: 'none'
                                }}
                            >
                                PRESS SPACE
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSettingsChange={handleSettingsChange} />

            <CandyModal
                isOpen={confirmHome}
                title="Go Home?"
                message="Are you sure you want to go back to the home page? You will lose all your current level progress."
                onConfirm={() => { setConfirmHome(false); resetToHome(); }}
                onCancel={() => setConfirmHome(false)}
            />

            <CandyModal
                isOpen={confirmRestart}
                title="Restart Level?"
                message="Resetting this level will clear your current progress and gems. Your lives will remain the same. Continue?"
                onConfirm={() => { setConfirmRestart(false); restartLevel(); }}
                onCancel={() => setConfirmRestart(false)}
            />

            <input
                ref={hiddenInputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
                className="fixed top-0 left-0 w-px h-px opacity-0 -z-10"
                onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    console.log('[Input Debug] onInput fired, value:', val);

                    // Process the keystroke
                    if (val) {
                        const char = val.slice(-1);
                        console.log('[Input Debug] Processing character:', char);
                        handleInput(char);
                        (e.target as HTMLInputElement).value = '';
                    }
                }}
                onKeyDown={(e) => {
                    console.log('[Input Debug] onKeyDown fired, key:', e.key);
                    if (e.key === 'Backspace') {
                        handleInput('Backspace');
                        (e.target as HTMLInputElement).value = '';
                    }
                }}
            />
        </div>
    );
}

export default App;
