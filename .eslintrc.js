module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['jest'],
    rules: {
        'comma-dangle': ['error', 'always-multiline'],
        'quotes': ['error', 'single'],
        'no-console': ['error'],
    },
};
