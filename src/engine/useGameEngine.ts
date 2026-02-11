import { useState, useEffect, useCallback, useRef } from 'react';
import { toLeetSpeak, scrambleInternal, swapAdjacent } from './GlitchGenerators';
import { fetchParagraph, fetchParagraphBatch } from './api';

export type GameState = 'idle' | 'playing' | 'crashed' | 'victory';

interface UseGameEngineProps {
    initialLevel?: number;
    onPlaySound?: (type: 'type' | 'error' | 'success' | 'crash') => void;
}

export const useGameEngine = ({ initialLevel = 1, onPlaySound }: UseGameEngineProps) => {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [level, setLevel] = useState(initialLevel);
    const [fullText, setFullText] = useState<string[]>([]);
    const [wordIndex, setWordIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState('');
    const [isLevelStarted, setIsLevelStarted] = useState(false);

    // Stats
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [glitchMeter, setGlitchMeter] = useState(0); // 0 to 100
    const [errors, setErrors] = useState(0);
    const [lives, setLives] = useState(3);

    const [wordTimer, setWordTimer] = useState(100); // 100%
    const timerRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const lastInputTimeRef = useRef<number>(0);

    // Refs for Loop (avoid stale closure)
    const levelRef = useRef(level);
    const comboRef = useRef(combo);
    const gameStateRef = useRef(gameState);
    const isLevelStartedRef = useRef(isLevelStarted);

    const [paragraphQueue, setParagraphQueue] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSpaceWarning, setShowSpaceWarning] = useState(false);

    // Level 6 Recovery Logic
    const [rotation, setRotation] = useState(0);
    const [pristineStreak, setPristineStreak] = useState(0);
    const [errorsThisWord, setErrorsThisWord] = useState(0);

    useEffect(() => { levelRef.current = level; }, [level]);
    useEffect(() => { comboRef.current = combo; }, [combo]);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { isLevelStartedRef.current = isLevelStarted; }, [isLevelStarted]);

    // Initial Fetch
    useEffect(() => {
        const initBatch = async () => {
            setIsLoading(true);
            const batch = await fetchParagraphBatch(5);
            setParagraphQueue(batch);
            setIsLoading(false);
        };
        initBatch();
    }, []);

    // Refill Queue
    useEffect(() => {
        if (paragraphQueue.length < 3 && !isLoading && gameState === 'playing') {
            const refill = async () => {
                const next = await fetchParagraph();
                setParagraphQueue(prev => [...prev, next]);
            };
            refill();
        }
    }, [paragraphQueue.length, isLoading, gameState]);

    const handleWordTimeout = useCallback(() => {
        onPlaySound?.('error');
        setCombo(0);
        setShowSpaceWarning(false);
        setGlitchMeter(prev => Math.min(prev + 20, 100)); // Grow meter on timeout
        setErrorsThisWord(0);
        setPristineStreak(0);
        if (levelRef.current === 6) {
            setRotation(prev => (prev + 15) % 360); // 360 rotation
        }
        // Rewind logic: go back 1 word or stay at 0
        setWordIndex(prev => Math.max(0, prev - 1));
        setCurrentInput('');
        // Flash red or shake screen logic handled by UI via state
    }, [onPlaySound]);

    // Game Loop
    const gameLoop = useCallback((time: number) => {
        if (gameStateRef.current !== 'playing') return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Word Timer Decay
        // Baseline: 5 seconds to complete a word (20% per second)
        // Level 6 is fixed to 5s to compensate for high difficulty
        const baseDecay = levelRef.current === 6 ? 0.02 : (0.02 + (levelRef.current * 0.002));
        const decayRate = baseDecay * deltaTime;

        // Requirement: Halt countdown while typing or within 1s grace period
        const timeSinceLastInput = time - lastInputTimeRef.current;
        const isIdle = timeSinceLastInput > 1000;

        // Pause decay if level not started OR if player is actively typing (within grace)
        if (!isLevelStartedRef.current || !isIdle) {
            timerRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        setWordTimer(prev => {
            const next = prev - decayRate;
            if (next <= 0) {
                handleWordTimeout();
                return 100;
            }
            return next;
        });

        if (gameStateRef.current === 'playing') {
            timerRef.current = requestAnimationFrame(gameLoop);
        }
    }, [handleWordTimeout]);

    // Initialize Game
    const startGame = useCallback(async () => {
        let paragraph = paragraphQueue[0];

        // Ensure we have at least one paragraph
        if (!paragraph) {
            setIsLoading(true);
            paragraph = await fetchParagraph();
            setIsLoading(false);
        }

        setFullText(paragraph.split(' ').filter(w => w.length > 0));
        setParagraphQueue(prev => prev.slice(1));

        setWordIndex(0);
        setCurrentInput('');
        setIsLevelStarted(true);
        setShowSpaceWarning(false);
        setScore(0);
        setCombo(0);
        setGlitchMeter(0);
        setErrors(0);
        setLives(3);
        setLevel(initialLevel);
        setRotation(0);
        setPristineStreak(0);
        setErrorsThisWord(0);
        setGameState('playing');
        setWordTimer(100);
        lastTimeRef.current = performance.now();
        requestAnimationFrame(gameLoop);
    }, [initialLevel, gameLoop, paragraphQueue]);

    const handleInput = (char: string) => {
        if (gameState !== 'playing') return;

        lastInputTimeRef.current = performance.now();

        if (!isLevelStarted) {
            setIsLevelStarted(true);
            lastTimeRef.current = performance.now(); // Reset delta time anchor
        }

        // Backspace logic
        if (char === 'Backspace') {
            setCurrentInput(prev => prev.slice(0, -1));
            setShowSpaceWarning(false);
            return;
        }

        if (char.length !== 1) return; // Ignore non-char keys

        const targetWord = fullText[wordIndex];

        // SPACE to advance
        if (char === ' ') {
            if (currentInput === targetWord) {
                setShowSpaceWarning(false);
                completeWord();
            } else {
                // Mistake: pressed space early or on wrong word
                onPlaySound?.('error');
                setErrors(prev => prev + 1);
                setErrorsThisWord(prev => prev + 1);
                setCombo(0);
                setGlitchMeter(prev => Math.min(prev + 5, 100));
                if (level === 6) setRotation(prev => (prev + 15) % 360);
                setPristineStreak(0);
            }
            return;
        }

        const nextInput = currentInput + char;

        // Check if correct so far
        if (targetWord.startsWith(nextInput)) {
            setCurrentInput(nextInput);
            onPlaySound?.('type');
            setShowSpaceWarning(false);

            // AUTO-COMPLETE if it's the LAST word of the paragraph
            if (nextInput === targetWord && wordIndex === fullText.length - 1) {
                completeWord();
            }
        } else {
            // Mistake
            onPlaySound?.('error');

            // Hint: if they are typing AFTER the word is finished (and it's not the last word)
            if (currentInput === targetWord && wordIndex < fullText.length - 1) {
                setShowSpaceWarning(true);
            }

            setErrors(prev => prev + 1);
            setErrorsThisWord(prev => prev + 1);
            setCombo(0);
            setGlitchMeter(prev => Math.min(prev + 5, 100)); // Small penalty
            if (level === 6) setRotation(prev => (prev + 15) % 360);
            setPristineStreak(0);
            // Optional: Visual shake
        }
    };

    const completeWord = async () => {
        onPlaySound?.('success');
        setScore(prev => prev + (10 * (combo + 1)));
        setCombo(prev => prev + 1);
        setGlitchMeter(prev => Math.max(0, prev - 10)); // Recovery
        setWordTimer(100);
        setCurrentInput('');

        // Level 6 Recovery Logic
        if (level === 6) {
            if (errorsThisWord === 0) {
                const nextStreak = pristineStreak + 1;
                if (nextStreak === 1) {
                    setRotation(prev => prev / 2);
                    setPristineStreak(1);
                } else if (nextStreak >= 2) {
                    setRotation(0);
                    setPristineStreak(0);
                }
            } else {
                setPristineStreak(0);
            }
        }
        setErrorsThisWord(0);

        if (wordIndex >= fullText.length - 1) {
            // Level/Sentence Complete
            // Fetch next paragraph from queue
            let paragraph = paragraphQueue[0];
            if (!paragraph) {
                setIsLoading(true);
                paragraph = await fetchParagraph();
                setIsLoading(false);
            }

            setFullText(paragraph.split(' ').filter(w => w.length > 0));
            setParagraphQueue(prev => prev.slice(1));
            setWordIndex(0);

            // Increase level
            setLevel(prev => {
                const nextLevel = prev + 1;
                if (prev >= 6) {
                    setGameState('victory');
                    if (timerRef.current) cancelAnimationFrame(timerRef.current);
                    return prev;
                }
                // Reset start flag for new level
                setIsLevelStarted(false);
                setWordTimer(100);
                return nextLevel;
            });
        } else {
            setWordIndex(prev => prev + 1);
        }
    };

    // Check for crash
    useEffect(() => {
        if (glitchMeter >= 100) {
            // Lose a life
            setLives(prev => {
                const next = prev - 1;
                if (next <= 0) {
                    setGameState('crashed');
                    onPlaySound?.('crash');
                    if (timerRef.current) cancelAnimationFrame(timerRef.current);
                    return 0;
                } else {
                    // Recover but with penalty?
                    // Reset meter, maybe rewind significantly?
                    setGlitchMeter(0);
                    onPlaySound?.('crash'); // Still play sound? Maybe a 'hurt' sound
                    return next;
                }
            });
        }
    }, [glitchMeter]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        };
    }, []);

    // Compute display word based on level
    const getDisplayWord = (original: string, index: number) => {
        // Apply level logic here
        // Level 1: Leet
        // Level 3: Swap
        // Level 5: Anagram
        // Level 6: Mix

        let processed = original;

        if (level === 1 || level === 6) {
            processed = toLeetSpeak(processed);
        }

        if (level === 3) {
            processed = swapAdjacent(processed);
        }

        if (level === 5 || level === 6) {
            processed = scrambleInternal(processed, index);
        }

        return processed;
    };

    return {
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
        errors,
        lives,
        isLevelStarted,
        showSpaceWarning,
        isLoading,
        rotation
    };
};
