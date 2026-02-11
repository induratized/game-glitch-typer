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

    // Visible window of words (e.g., current - 2 to current + 10)
    const visibleStart = Math.max(0, currentIndex - 2);
    const visibleEnd = Math.min(words.length, currentIndex + 8);
    const visibleWords = words.slice(visibleStart, visibleEnd);

    return (
        <motion.div
            className="relative p-8 candy-card rounded-2xl border-2 border-purple-400/40 shadow-2xl overflow-hidden backdrop-blur-sm"
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
            {/* Start Prompt Overlay */}
            {!isLevelStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm pointer-events-none">
                    <div className="text-cyan-400 font-mono text-xl animate-pulse tracking-widest">[ TYPE TO START LEVEL {level} ]</div>
                </div>
            )}

            <div className="flex flex-wrap gap-3 text-lg md:text-2xl font-semibold leading-relaxed justify-start items-center min-h-[120px]">
                <AnimatePresence mode="popLayout">
                    {visibleWords.map((originalWord, i) => {
                        const absoluteIndex = visibleStart + i;
                        const isCurrent = absoluteIndex === currentIndex;
                        const isPast = absoluteIndex < currentIndex;
                        const displayWord = getDisplayWord(originalWord, absoluteIndex);

                        const randomSeed = (originalWord.length + absoluteIndex) % 10;
                        const flickerDuration = (0.4 + (randomSeed / 10) * 1.1).toFixed(2) + 's';

                        return (
                            <motion.div
                                key={`${absoluteIndex}-${originalWord}`}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: isCurrent ? 1.08 : 1
                                }}
                                transition={{
                                    opacity: { duration: 0.3 },
                                    layout: { duration: 0.2 },
                                    scale: { duration: 0.2 }
                                }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                                className={clsx(
                                    "relative px-4 py-3 rounded-xl transition-all duration-200 tile-base tile-gloss",
                                    isCurrent && "candy-card shadow-pop border-2 border-candy-pink/60",
                                    isCurrent ? "text-white z-20" : "text-gray-400",
                                    isPast && "text-gray-600 opacity-60",
                                    !isCurrent && !isPast && "hover:text-gray-300"
                                )}
                                style={{
                                    ...(level === 2 ? {
                                        animation: `flicker ${flickerDuration} infinite alternate`,
                                        animationPlayState: isLevelStarted ? 'running' : 'paused'
                                    } : {})
                                }}
                            >
                                <div className="flex items-center gap-2 relative">
                                    <span className="relative z-20">
                                        {isCurrent ? (
                                            <>
                                                <motion.span
                                                    className="inline-block"
                                                    animate={{
                                                        opacity: level === 4 && isLevelStarted ? [1, 0] : 1
                                                    }}
                                                    transition={{
                                                        duration: level === 4 ? Math.min(2.5, Math.max(0.5, originalWord.length * 0.3)) : 0.3,
                                                        ease: "linear"
                                                    }}
                                                >
                                                    <span className="text-lime-300 font-bold">{currentInput}</span>
                                                    <span className="text-white/70">{displayWord.slice(currentInput.length)}</span>
                                                </motion.span>

                                                {/* Speech Bubble for Space Warning */}
                                                {showSpaceWarning && currentIndex < words.length - 1 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        className="speech-bubble absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap text-white"
                                                    >
                                                        ⚠️ Press Space!
                                                    </motion.div>
                                                )}
                                            </>
                                        ) : (
                                            isPast ? originalWord : displayWord
                                        )}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-candy-mint to-candy-pink rounded-full z-30"
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${wordTimer}%` }}
                                        transition={{ ease: 'linear', duration: 0.016 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
