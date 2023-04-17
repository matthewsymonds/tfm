/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './stories/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    DEFAULT: 'hsl(28, 90%, 60%)',
                },

                dark: {
                    1: 'hsl(0, 0%, 15%)',
                    2: 'hsl(0, 0%, 23%)',
                    3: 'hsl(0, 0%, 30%)',
                    4: 'hsl(0, 0%, 40%)',
                    5: 'hsl(0, 0%, 50%)',
                },
            },
            theme: {
                fontSize: {
                    xxs: ['10px', '14px'],
                    xs: ['12px', '16px'],
                    sm: ['14px', '20px'],
                    base: ['16px', '24px'],
                    lg: ['20px', '28px'],
                    xl: ['24px', '32px'],
                },
            },
        },
    },
    plugins: [],
};
