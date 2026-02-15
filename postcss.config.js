export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'Android >= 4.0',
        'iOS >= 8',
        'Chrome >= 40',
        'Safari >= 8',
        '> 1%',
        'last 2 versions',
      ],
    },
  },
}
