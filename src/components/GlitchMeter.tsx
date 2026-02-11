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
        <div className="w-full max-w-md bg-gray-800 h-6 rounded-full overflow-hidden border border-gray-700 relative shadow-lg">
            <motion.div
                className={`h-full bg-gradient-to-r ${colors[state]}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%`, ...shakeEffect }}
                transition={{ type: 'spring', damping: 20 }}
            />
            {state === 'fire' && (
                <div className="absolute inset-0 bg-red-500/20 z-10 animate-flash" />
            )}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                SYSTEM STABILITY: {100 - value}%
            </div>
        </div>
    );
};
