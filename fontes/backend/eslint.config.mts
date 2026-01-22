import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
	// Ignorar arquivos e pastas que não devem ser lidados
	{
		ignores: [
			'**/*.d.ts',
			'dist/**',
			'node_modules/**',
			'.husky/**',
			'.git/**',
			'.env*',
			'Dockerfile'
		]
	},

	js.configs.recommended,
	...tseslint.configs.recommended,

	// Bloco customizado
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		languageOptions: {
			globals: {
				...globals.node
			}
		},
		rules: {
			// Regra base duplicada com TS — desative a base e use a de TS
			'no-unused-vars': 'off',

			// Regra de TS para unused vars
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],

			'no-self-assign': 'off',
			'@typescript-eslint/no-require-imports': 'warn',

			'prefer-const': 'warn',
			'no-useless-catch': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-wrapper-object-types': 'off',

			'no-console': 'error'
		}
	},

	// Prettier para desligar conflitos de formatação
	prettier
]);
