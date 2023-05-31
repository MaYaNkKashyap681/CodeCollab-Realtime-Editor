export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        allura: ['Allura', 'cursive']
      },
      backgroundImage: {
        'leftpattern': "url('/src/assets/bgImage.jpg)",
      }
    },
  },
  plugins: [],
}