/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Roar Guroes', 'Rapunled', 'Fredoka One', 'Baloo 2', 'cursive'],
                sans: ['Inter', 'ui-sans-serif', 'system-ui']
            },
            colors: {
                candy: {
                    pink: '#FF7AB6',
                    'hot-pink': '#FF4D6D',
                    mint: '#7AF6D9',
                    lemon: '#FFE27A',
                    violet: '#B78BFF',
                    coral: '#FF9B77',
                    cream: '#FFF4DD',
                    'soft-orange': '#FFB84D',
                    'sky-blue': '#7DD3FC',
                    'berry': '#E879F9'
                },
                gem: {
                    ruby: '#E61E5C',
                    emerald: '#10B981',
                    sapphire: '#3B82F6',
                    topaz: '#F59E0B',
                    amethyst: '#A78BFA'
                }
            },
            borderRadius: {
                xl2: '1.25rem',
                full: '9999px'
            },
            boxShadow: {
                candy: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
                'gem-glow': '0 0 20px rgba(230,30,92,0.4)',
                'mint-glow': '0 0 20px rgba(122,246,217,0.4)',
                'pop': '0 8px 24px rgba(0,0,0,0.4)'
            },
            animation: {
                'pop': 'pop 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                'bounce-pop': 'bounce-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                'flip': 'flip 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'wiggle-glow': 'wiggle-glow 200ms ease-in-out infinite',
                'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
                'roll-number': 'roll-number 300ms ease-out'
            },
            keyframes: {
                'bounce-pop': {
                    '0%, 100%': { transform: 'scale(1) translateY(0)' },
                    '50%': { transform: 'scale(1.15) translateY(-8px)' }
                },
                'flip': {
                    '0%': { transform: 'rotateY(0) rotateX(0)' },
                    '50%': { transform: 'rotateY(90deg) rotateX(-15deg)' },
                    '100%': { transform: 'rotateY(0) rotateX(0)' }
                },
                'wiggle-glow': {
                    '0%, 100%': { transform: 'translateX(0)', filter: 'drop-shadow(0 0 8px rgba(255,77,109,0.4))' },
                    '25%': { transform: 'translateX(-2px)', filter: 'drop-shadow(0 0 12px rgba(255,77,109,0.6))' },
                    '75%': { transform: 'translateX(2px)', filter: 'drop-shadow(0 0 12px rgba(255,77,109,0.6))' }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(255,77,109,0.3)' },
                    '50%': { boxShadow: '0 0 24px rgba(255,77,109,0.6)' }
                },
                'roll-number': {
                    '0%': { transform: 'translateY(0) opacity: 1' },
                    '100%': { transform: 'translateY(-20px) opacity: 0' }
                }
            }
        },
    },
    plugins: [],
}
