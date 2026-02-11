import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface TypingAreaProps {
    words: string[];
    currentIndex: number;
    currentInput: string;
    getDisplayWord: (word: string, index: number) => string;
    wordTimer: number; // 0-100
    level: number;
}

export const TypingArea = ({
    words,
    currentIndex,
    currentInput,
    getDisplayWord,
    wordTimer,
    level,
    isLevelStarted,
    showSpaceWarning,
    rotation
}: TypingAreaProps & { isLevelStarted: boolean; showSpaceWarning: boolean; rotation: number }) => {

    // Visible window of words (e.g., current - 2 to current + 8)
    const visibleStart = Math.max(0, currentIndex - 2);
    const visibleEnd = Math.min(words.length, currentIndex + 8);
    const visibleWords = words.slice(visibleStart, visibleEnd);

    return (
        <motion.div
            className="relative p-10 bg-black/30 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden playfield-container"
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Start Prompt Overlay */}
            {!isLevelStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-md pointer-events-none">
                    <div className="text-candy-mint font-bold text-2xl animate-pulse tracking-[0.2em] transform -rotate-2">
                        [ TYPE TO START LEVEL {level} ]
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-6 text-2xl font-bold leading-relaxed justify-center items-center min-h-[160px]">
                <AnimatePresence mode="popLayout">
                    {visibleWords.map((originalWord, i) => {
                        const absoluteIndex = visibleStart + i;
                        const isCurrent = absoluteIndex === currentIndex;
                        const isPast = absoluteIndex < currentIndex;
                        const displayWord = getDisplayWord(originalWord, absoluteIndex);

                        return (
                            <motion.div
                                key={`${absoluteIndex}-${originalWord}`}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    scale: isCurrent ? 1.1 : (isPast ? 0.9 : 1),
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    y: -20,
                                    transition: { duration: 0.2 }
                                }}
                                className={clsx(
                                    "candy-tile tile-gloss",
                                    isCurrent ? "current" : (isPast ? "past" : "")
                                )}
                            >
                                <div className="relative z-20 flex items-center">
                                    {isCurrent ? (
                                        <div className="relative">
                                            {/* Mascot Speech Bubble */}
                                            {showSpaceWarning && currentIndex < words.length - 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: -45 }}
                                                    className="speech-bubble"
                                                >
                                                    PRESS SPACE! 🍬
                                                </motion.div>
                                            )}

                                            <span className="flex">
                                                {displayWord.split('').map((char, charIdx) => {
                                                    const isTyped = charIdx < currentInput.length;
                                                    const isTypingNow = charIdx === currentInput.length - 1;
                                                    return (
                                                        <span
                                                            key={charIdx}
                                                            className={clsx(
                                                                "letter-pop-char font-mono",
                                                                isTyped ? "text-candy-mint" : "text-white/40",
                                                                isTypingNow && "pop"
                                                            )}
                                                        >
                                                            {char}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="font-mono">
                                            {isPast ? originalWord : displayWord}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar on Tile */}
                                {isCurrent && (
                                    <div className="absolute bottom-1 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full"
                                            initial={{ width: '100%' }}
                                            animate={{
                                                width: `${wordTimer}%`,
                                                backgroundColor: wordTimer > 50 ? '#7AF6D9' : (wordTimer > 25 ? '#FFD166' : '#FF4D6D'),
                                                boxShadow: wordTimer < 25 ? '0 0 8px #FF4D6D' : 'none'
                                            }}
                                            transition={{ ease: 'linear', duration: 0.1 }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
