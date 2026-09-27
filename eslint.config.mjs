/**
 * @file eslint.config.mjs
 * @description ESLint 설정. Next.js 권장 규칙에 import 순서와 코드 품질 규칙을 더한다.
 */
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // `x != null`은 null과 undefined를 한 번에 검사하는 관용구라 허용한다.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // 기본 규칙은 TS 타입 시그니처의 파라미터 이름을 미사용으로 오탐한다.
      // 미사용 코드는 tsconfig의 noUnusedLocals / noUnusedParameters가 잡는다.
      'no-unused-vars': 'off',
      'prefer-const': ['error', { destructuring: 'all' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@next/next/no-img-element': 'warn',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          'newlines-between': 'always',
          // builtin·external로 분류된 import에는 pathGroups를 적용하지 않는다.
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  prettierConfig,

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
