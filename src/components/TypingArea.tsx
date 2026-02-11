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
            className="relative p-8 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }} // Elastic snap
        >
            {/* Start Prompt Overlay */}
            {!isLevelStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm pointer-events-none">
                    <div className="text-cyan-400 font-mono text-xl animate-pulse tracking-widest">[ TYPE TO START LEVEL {level} ]</div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 text-2xl font-mono leading-relaxed justify-start items-center min-h-[120px]">
                <AnimatePresence mode="popLayout">
                    {visibleWords.map((originalWord, i) => {
                        const absoluteIndex = visibleStart + i;
                        const isCurrent = absoluteIndex === currentIndex;
                        const isPast = absoluteIndex < currentIndex;
                        const displayWord = getDisplayWord(originalWord, absoluteIndex);

                        // Simple deterministic "random" based on word content/index to keep animation stable
                        const randomSeed = (originalWord.length + absoluteIndex) % 10;
                        const flickerDuration = (0.4 + (randomSeed / 10) * 1.1).toFixed(2) + 's';

                            return (
                                <motion.div
                                    key={`${absoluteIndex}-${originalWord}`}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        opacity: { duration: 0.3 },
                                        layout: { duration: 0.2 }
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={clsx(
                                        "relative px-3 py-2 rounded-2xl transition-colors duration-200 tile-gloss",
                                        isCurrent ? "bg-white/10 text-white scale-110 z-10 shadow-glow" : "text-gray-500",
                                        isPast && "text-gray-700 opacity-50",
                                    )}
                                    style={{
                                        ...(level === 2 ? {
                                            animation: `flicker ${flickerDuration} infinite alternate`,
                                            animationPlayState: isLevelStarted ? 'running' : 'paused'
                                        } : {})
                                    }}
                                >
                                    <div className={clsx("flex items-center gap-3", isCurrent ? "bg-white/10 text-white px-2 py-1 rounded" : '')}> 
                                        {/* decorative slot for an icon removed to keep typing area clean */}
                                        <span className="relative z-20">
                                            {isCurrent ? (
                                                <>
                                                    <motion.span
                                                        className="animate-pop"
                                                        animate={{
                                                            opacity: level === 4 && isLevelStarted ? [1, 0] : 1
                                                        }}
                                                        transition={{
                                                            duration: level === 4 ? Math.min(2.5, Math.max(0.5, originalWord.length * 0.3)) : 0.3,
                                                            ease: "linear"
                                                        }}
                                                    >
                                                        <span className="text-green-400">{currentInput}</span>
                                                        <span className="text-white/80">{displayWord.slice(currentInput.length)}</span>
                                                    </motion.span>

                                                    {showSpaceWarning && currentIndex < words.length - 1 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: [1, 1.2, 1],
                                                                x: [0, -5, 5, -5, 5, 0],
                                                                color: "#ff3333"
                                                            }}
                                                            transition={{
                                                                x: { duration: 0.4, ease: "easeInOut" },
                                                                opacity: { duration: 0.2 }
                                                            }}
                                                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap tracking-wider animate-pulse drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]"
                                                        >
                                                            [ PRESS SPACE ]
                                                        </motion.div>
                                                    )}
                                                </>
                                            ) : (
                                                isPast ? originalWord : displayWord
                                            )}
                                        </span>
                                    </div>

                                    {isCurrent && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-1 bg-cyan-400 z-30 rounded-full"
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
