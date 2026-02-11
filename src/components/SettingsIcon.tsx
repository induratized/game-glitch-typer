import { motion } from 'framer-motion';

interface SettingsIconProps {
  isOpen?: boolean;
}

/**
 * Simple grey gear icon with thick white outline
 */
export function SettingsIcon({ isOpen = false }: SettingsIconProps) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width="48"
      height="48"
      animate={{ rotate: isOpen ? 90 : 0 }}
      transition={{ duration: 0.35 }}
      className="drop-shadow-lg"
    >
      <defs>
        <radialGradient id="metalGrad" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#bdbdbd" />
          <stop offset="60%" stopColor="#8f8f8f" />
          <stop offset="100%" stopColor="#6e6e6e" />
        </radialGradient>
        <linearGradient id="shine" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#fff8e6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#fff8e6" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <g>
        {/* Gear teeth */}
        {[...Array(12)].map((_, i) => (
          <path
            key={i}
            d="M50 12 L54 20 L66 24 L62 36 L66 48 L54 52 L50 60 L46 52 L34 48 L38 36 L34 24 L46 20 Z"
            transform={`rotate(${i * 30} 50 50)`}
            fill="url(#metalGrad)"
            stroke="#F7EEDC"
            strokeWidth="2"
            opacity="0.98"
          />
        ))}

        {/* Outer body */}
        <circle cx="50" cy="50" r="30" fill="url(#metalGrad)" stroke="#F7EEDC" strokeWidth="3" />

        {/* Shine overlay */}
        <ellipse cx="40" cy="36" rx="18" ry="8" fill="url(#shine)" opacity="0.65" />

        {/* Inner hub */}
        <circle cx="50" cy="50" r="14" fill="#F7EEDC" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="6" fill="#6b6b6b" stroke="#FFFFFF" strokeWidth="1" />
      </g>
    </motion.svg>
  );
}

export default SettingsIcon;
