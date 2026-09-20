import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

const lintPlugins = [
  'eslint',
  'typescript',
  'unicorn',
  'oxc',
  'react',
  'import',
  'jsx-a11y',
  'promise',
] as const;

export default defineConfig({
  fmt: {
    ignorePatterns: [
      'dist/**',
      '**/*.gen.ts',
      '.tanstack/**',
    ],
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
    sortImports: {
      ignoreCase: true,
      newlinesBetween: true,
      order: 'asc',
      sortSideEffects: false,
    },
    sortPackageJson: { sortScripts: true },
  },
  lint: {
    ignorePatterns: [
      'dist/**',
      '**/*.gen.ts',
      '.tanstack/**',
    ],
    plugins: [...lintPlugins],
    categories: { correctness: 'error', suspicious: 'error' },
    env: { browser: true, es2026: true },
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // React 19 uses the automatic JSX transform.
      'react/react-in-jsx-scope': 'off',
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'error',
      'react/only-export-components': ['error', { allowConstantExport: true }],
      'react/jsx-filename-extension': [
        'error',
        { allow: 'as-needed', extensions: ['.tsx', '.jsx'] },
      ],
      'react/jsx-max-depth': ['error', { max: 8 }],
      eqeqeq: ['error', 'always'],
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'typescript/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'typescript/no-import-type-side-effects': 'off',
      'typescript/no-explicit-any': 'error',
      'typescript/no-non-null-assertion': 'error',
      'typescript/no-floating-promises': 'error',
      'typescript/no-misused-promises': 'error',
      'eslint/one-var': ['error', 'never'],
      'eslint/func-style': [
        'error',
        'declaration',
        { allowArrowFunctions: true },
      ],
      'eslint/max-lines-per-function': [
        'error',
        { max: 220, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'vite-plus/prefer-vite-plus-imports': 'error',
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
  resolve: {
    alias: { '@': `${import.meta.dirname}/src` },
    dedupe: ['react', 'react-dom'],
  },
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
    tailwindcss(),
  ]),
  staged: { '*': 'vp check --fix' },
});
