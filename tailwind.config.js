/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./Screens/**/*.{js,jsx,ts,tsx}", "./composants/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'transparent-black': 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

