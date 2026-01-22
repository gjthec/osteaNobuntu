import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';

export default tseslint.config(
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettierConfig,
	{
		files: ['**/*.ts'],
		plugins: {
			prettier,
			'@angular-eslint': angular,
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			// ---- Integração com Prettier ----
			'prettier/prettier': 'error',

			// ---- Regras de boas práticas TypeScript ----
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',

			// ---- Regras Angular ----
			'@angular-eslint/directive-selector': [
				'error',
				{ type: 'attribute', prefix: 'app', style: 'camelCase' },
			],
			'@angular-eslint/component-selector': [
				'error',
				{ type: 'element', prefix: 'app', style: 'kebab-case' },
			],
		},
	},
	{
		files: ['**/*.html'],
    language: 'html',
		plugins: {
			'@angular-eslint/template': angularTemplate,
			prettier,
		},
		languageOptions: {
			parser: angularTemplate.parser,
		},
		rules: {
			// Regras do Prettier para HTML
			'prettier/prettier': 'error',
			'@angular-eslint/template/no-negated-async': 'warn',
			'@angular-eslint/template/banana-in-box': 'error',
			'@angular-eslint/template/eqeqeq': 'error',
			'@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 5 }],
		},
	}
);