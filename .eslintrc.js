module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],  // Add this line to ensure ESLint processes .vue files
  },
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  rules: {
    // Your custom rules
  },
};