/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './lib/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    50: '#FFF7ED',
                    100: '#FFEDD5',
                    200: '#FED7AA',
                    300: '#FDBA74',
                    400: '#FB923C',
                    500: '#F97316',
                    600: '#EA580C',
                    700: '#C2410C',
                    800: '#9A3412',
                    900: '#7C2D12',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                },
            },
            fontFamily: {
                primary: ['var(--font-primary)', 'Inter', 'system-ui', 'sans-serif'],
                heading: ['var(--font-heading)', 'Poppins', 'system-ui', 'sans-serif'],
                secondary: ['var(--font-secondary)', 'Roboto', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeInUp 0.6s ease-out forwards',
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
