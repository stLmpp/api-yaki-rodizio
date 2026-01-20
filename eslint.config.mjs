// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allowAny: true,
					allowNumber: true,
					allowArray: true,
					allowBoolean: true,
					allowNever: true,
					allowNullish: true,
					allowRegExp: true,
				},
			],
			'@typescript-eslint/array-type': [
				'error',
				{ default: 'array-simple', readonly: 'array-simple' },
			],
		},
	},
);
