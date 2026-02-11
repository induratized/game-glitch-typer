import { motion } from 'framer-motion';
import { useMemo } from 'react';
import clsx from 'clsx';

interface GlitchMeterProps {
    value: number; // 0 to 100
}

export const GlitchMeter = ({ value }: GlitchMeterProps) => {
    const state = useMemo(() => {
        if (value < 30) return 'ice';
        if (value < 70) return 'water';
        return 'fire';
    }, [value]);

    const gemColor = state === 'fire' ? 'ruby' : state === 'water' ? 'sapphire' : 'emerald';
    const textColor = state === 'fire' ? 'text-red-400' : state === 'water' ? 'text-blue-400' : 'text-cyan-300';

    const segmentCount = 10;
    const filledSegments = Math.floor((value / 100) * segmentCount);

    const shakeEffect = state === 'fire' ? {
        x: [0, -2, 2, -1, 1, 0],
        transition: { repeat: Infinity, duration: 0.2 }
    } : {};

    return (
        <motion.div
            className={clsx(
                "w-full max-w-2xl flex flex-col gap-3 z-10 transition-all duration-300",
                state === 'fire' && "fire-zone"
            )}
        >
            {/* Candy Bar with Gem Segments */}
            <motion.div
                className="w-full h-16 rounded-xl overflow-hidden candy-card flex gap-2 items-center justify-center p-3 border-2 border-purple-400/50"
                animate={{ scale: [1, 1.02, 1], ...shakeEffect }}
                key={state}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex gap-1 h-full flex-1 items-center">
                    {[...Array(segmentCount)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={clsx(
                                "gem-segment flex-1 h-full",
                                i < filledSegments && gemColor,
                                i < filledSegments && "active"
                            )}
                            animate={i < filledSegments ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ delay: i * 0.05 }}
                        />
                    ))}
                </div>

                {/* Numeric Level Display */}
                <div className="flex flex-col items-center gap-1">
                    <div className={clsx("text-3xl font-black score-level-font", textColor)}>
                        {100 - value}%
                    </div>
                    <div className="text-xs uppercase tracking-widest font-bold text-gray-300">Stability</div>
                </div>
            </motion.div>

            {/* Fire State Indicator Spark & Particles */}
            {state === 'fire' && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-red-400 rounded-full"
                            initial={{ x: "50%", y: "50%", opacity: 1 }}
                            animate={{
                                x: `${Math.random() * 200 - 50}%`,
                                y: `${Math.random() * 200 - 200}%`,
                                opacity: 0,
                                rotate: Math.random() * 360
                            }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        />
                    ))}
                    <motion.div
                        className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scaleX: [1, 1.2, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                </div>
            )}
        </motion.div>
    );
};
