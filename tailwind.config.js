/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF2D55', // Sweet Romance Red
        dark: {
          bg: '#0F0F1A',
          card: '#1C1C2A',
          text: '#FFFFFF',
          muted: '#8E8E93'
        }
      },
      fontFamily: {
        serif: ['System'], // Using System serif for now, can be replaced with custom font
      }
    },
  },
  plugins: [],
}