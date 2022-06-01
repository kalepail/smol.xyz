module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-image-rendering')()
  ],
  purge: {
    content: ['./src/**/*.svelte'],
    options: {
      safelist: [
        {
          pattern: /grid-cols-\d*/,
        }
      ],
    },
  }
}