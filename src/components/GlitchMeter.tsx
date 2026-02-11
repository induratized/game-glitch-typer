import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface GlitchMeterProps {
    value: number; // 0 to 100
}

export const GlitchMeter = ({ value }: GlitchMeterProps) => {
    const state = useMemo(() => {
        if (value < 30) return 'ice';
        if (value < 70) return 'water';
        return 'fire';
    }, [value]);

    const colors = {
        ice: 'from-cyan-400 to-blue-600',
        water: 'from-blue-500 to-indigo-600',
        fire: 'from-orange-500 to-red-600 animate-pulse'
    };

    const shakeEffect = state === 'fire' ? {
        x: [0, -2, 2, -1, 1, 0],
        transition: { repeat: Infinity, duration: 0.2 }
    } : {};

    return (
        <motion.div
            className="w-full max-w-md h-10 rounded-full overflow-hidden border border-gray-700 relative shadow-lg candy-card"
            animate={{ scale: [1, 1.03, 1] }}
            key={state}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <motion.div
                className={`absolute left-0 top-0 bottom-0 h-full bg-gradient-to-r ${colors[state]} rounded-full`}
                style={{ transformOrigin: 'left center' }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%`, ...shakeEffect }}
                transition={{ type: 'spring', damping: 20 }}
            />

            {/* Decorative gem segments for candy feel (keeps underlying gradient classes for tests) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-xs font-bold text-white drop-shadow-md">SYSTEM STABILITY: {100 - value}%</div>
            </div>

            {state === 'fire' && (
                <div className="absolute inset-0 bg-red-500/20 z-10 animate-flash" />
            )}
        </motion.div>
    );
};
