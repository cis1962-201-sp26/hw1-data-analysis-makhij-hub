import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js, unicorn: eslintPluginUnicorn },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        rules: {
            // eslint base rules
            'no-lonely-if': 'error',
            eqeqeq: 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'prefer-template': 'error',
            'prefer-arrow-callback': 'error',
            'no-alert': 'warn',
            'no-unused-vars': 'warn',
            'consistent-return': 'off',

            // unicorn
            'unicorn/consistent-destructuring': 'error',
            'unicorn/error-message': 'error',
            'unicorn/no-abusive-eslint-disable': 'error',
            'unicorn/no-lonely-if': 'error',
            'unicorn/prefer-ternary': 'error',
        },
    },
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    eslintPluginPrettierRecommended,
]);
