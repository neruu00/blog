/**
 * Fix CLI for `eslint.config.mjs`
 * ```
 * npx eslint --fix  eslint.config.mjs
 * ```
 */
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import pluginQuery from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  ...pluginQuery.configs['flat/recommended'],
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      eqeqeq: ['error', 'always'], // ===, !== force
      'no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ], // unused vars warning
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
            'builtin', // Node.js 내장 모듈 (예: 'path', 'fs')
            'external', // npm 패키지 (예: 'react', 'next')
            'internal', // 내부 모듈 (@/...)
            'parent', // 부모 디렉토리 ('../')
            'sibling', // 형제 디렉토리 ('./')
            'index', // 현재 디렉토리의 index 파일 ('./index')
            'object', // <object> 태그 타입
            'type', // type import (import type { ... })
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          // 그룹 사이에 항상 한 줄의 공백을 추가하여 가독성을 높입니다.
          'newlines-between': 'always',
          // pathGroups에서 설정한 패턴을 다른 그룹과 중복해서 처리하지 않도록 합니다.
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          // 그룹 내에서도 알파벳 순으로 정렬합니다.
          alphabetize: {
            order: 'asc', // 오름차순
            caseInsensitive: true, // 대소문자 구분 없이
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
