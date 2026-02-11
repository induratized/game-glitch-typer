/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Rapunled', 'Fredoka One', 'Baloo 2', 'cursive'],
                sans: ['Inter', 'ui-sans-serif', 'system-ui']
            },
            colors: {
                candy: {
                    pink: '#FF7AB6',
                    mint: '#7AF6D9',
                    lemon: '#FFE27A',
                    violet: '#B78BFF',
                    coral: '#FF9B77'
                }
            },
            borderRadius: {
                xl2: '1.25rem'
            },
            boxShadow: {
                candy: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
            }
        },
    },
    plugins: [],
}
