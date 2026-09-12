import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

const lintPlugins = [
  'eslint',
  'typescript',
  'unicorn',
  'oxc',
  'react',
  'react-perf',
  'import',
  'jsx-a11y',
  'promise',
  'node',
] as const;

export default defineConfig({
  fmt: {
    ignorePatterns: ['**/*.gen.ts', '.tanstack/**'],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    jsxSingleQuote: false,
    trailingComma: 'all',
    arrowParens: 'always',
    bracketSpacing: true,
    bracketSameLine: false,
    endOfLine: 'lf',
    insertFinalNewline: true,
    quoteProps: 'as-needed',
    objectWrap: 'collapse',
    singleAttributePerLine: true,
    proseWrap: 'always',
    experimentalOperatorPosition: 'start',
    embeddedLanguageFormatting: 'auto',
    sortImports: {
      ignoreCase: true,
      newlinesBetween: true,
      order: 'asc',
      sortSideEffects: false,
    },
    sortPackageJson: { sortScripts: true },
    jsdoc: true,
  },
  lint: {
    ignorePatterns: ['dist/**', '**/*.gen.ts', '.tanstack/**'],
    plugins: [...lintPlugins],
    categories: {
      correctness: 'error',
      suspicious: 'error',
      restriction: 'error',
      perf: 'error',
      pedantic: 'error',
      style: 'error',
      nursery: 'error',
    },
    env: { browser: true, es2026: true },
    settings: { react: { version: '19.2.8' } },
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'react/rules-of-hooks': 'error',
      'react/only-export-components': ['error', { allowConstantExport: true }],
      'vite-plus/prefer-vite-plus-imports': 'error',

      // React 17+ JSX transform and TypeScript files.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [
        'error',
        { allow: 'as-needed', extensions: ['.tsx', '.jsx'] },
      ],

      // CSS side-effect imports are the Vite style path.
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],

      // Named exports only. These three fight each other if left on.
      'import/no-default-export': 'error',
      'import/prefer-default-export': 'off',
      'import/no-named-export': 'off',

      // One declaration per statement is the readable form.
      'eslint/one-var': ['error', 'never'],

      // oxfmt owns import order and object key layout.
      'eslint/sort-imports': 'off',
      'eslint/sort-keys': 'off',
      'unicorn/empty-brace-spaces': 'off',

      // Not an i18n app; literals in JSX are the UI.
      'react/jsx-no-literals': 'off',

      // Ban-the-language rules that are not useful here.
      'oxc/no-async-await': 'off',
      'eslint/no-continue': 'off',
      'eslint/capitalized-comments': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',

      'react/jsx-max-depth': ['error', { max: 8 }],
      'eslint/func-style': [
        'error',
        'declaration',
        { allowArrowFunctions: true },
      ],
      'eslint/max-lines-per-function': [
        'error',
        { max: 220, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
        },
      ],
      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, pascalCase: true, camelCase: true } },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'import/no-cycle': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'typescript/no-explicit-any': 'error',
      'typescript/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'typescript/explicit-function-return-type': 'off',
      'typescript/explicit-module-boundary-types': 'off',
      'typescript/no-non-null-assertion': 'error',
      'stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        {
          blankLine: 'always',
          prev: [
            'multiline-block-like',
            'multiline-expression',
            'multiline-const',
            'multiline-let',
            'multiline-var',
          ],
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'multiline-block-like',
            'multiline-expression',
            'multiline-const',
            'multiline-let',
            'multiline-var',
          ],
        },
      ],
    },
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'stylistic', specifier: '@stylistic/eslint-plugin' },
    ],
    overrides: [
      {
        files: ['vite.config.ts'],
        env: { node: true },
        rules: { 'import/no-default-export': 'off' },
      },
      {
        files: ['src/app/routes/**'],
        rules: {
          'react/only-export-components': 'off',
          'react/jsx-filename-extension': 'off',
          'unicorn/filename-case': 'off',
        },
      },
      {
        files: ['**/*.{test,spec}.{ts,tsx}'],
        plugins: [...lintPlugins, 'vitest'],
        env: { vitest: true },
      },
    ],
  },
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  plugins: lazyPlugins(() => [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
      quoteStyle: 'single',
      semicolons: true,
      addExtensions: true,
    }),
    react(),
  ]),
  staged: { '*': 'vp check --fix' },
});
