import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import globals from "globals";

export default defineConfig(
	globalIgnores(["dist", "node_modules"]),
	js.configs.recommended,
	...ts.configs.recommended.map(config => ({
		...config,
		files: ["**/*.mts", "**/*.cts", "**/*.ts"],
	})),
	{
		files: ["**/*.mts", "**/*.cts", "**/*.ts"],
		rules: {
			"@typescript-eslint/no-require-imports": 0,
			"@typescript-eslint/no-unused-vars": 0,
			"@typescript-eslint/no-unused-expressions": 0,
			"@typescript-eslint/no-this-alias": 0,
			"@typescript-eslint/no-explicit-any": 0,
			"@typescript-eslint/no-unsafe-function-type": 0,
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{
					"ts-ignore": false,
					"ts-nocheck": false,
				},
			],
		},
	},
	...vue.configs["flat/essential"].map(config => ({
		...config,
		files: ["**/*.vue"],
	})),
	...ts.configs.recommended.map(config => ({
		...config,
		files: ["**/*.vue"],
	})),
	{
		files: ["**/*.vue"],
		rules: {
			"vue/multi-word-component-names": 0,
			"@typescript-eslint/no-require-imports": 0,
			"@typescript-eslint/no-unused-vars": 0,
			"@typescript-eslint/no-unused-expressions": 0,
			"@typescript-eslint/no-this-alias": 0,
			"@typescript-eslint/no-explicit-any": 0,
			"@typescript-eslint/no-unsafe-function-type": 0,
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{
					"ts-ignore": false,
					"ts-nocheck": false,
				},
			],
			"no-unused-vars": 0,
			"no-undef": 0,
		},
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				parser: ts.parser,
			},
			globals: {
				...globals.browser,
			},
		},
	},
	{
		files: ["**/*.js", "**/*.mjs"],
		rules: {
			"no-class-assign": 0,
			"no-console": 0,
			"no-constant-condition": [
				"error",
				{
					checkLoops: false,
				},
			],
			"no-irregular-whitespace": [
				"error",
				{
					skipStrings: true,
					skipTemplates: true,
				},
			],
			"prefer-const": 0,
			"no-redeclare": 0,
			"no-undef": 0,
			"no-empty": [
				"error",
				{
					allowEmptyCatch: true,
				},
			],
			"no-unused-vars": 0,
			"require-yield": 0,
			"no-fallthrough": ["error", { commentPattern: "\\[falls[\\s\\w]*through\\]" }],
			// curly: "error",
		},
		languageOptions: {
			ecmaVersion: 13,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.es2015,
				...globals.node,
				...globals.serviceworker,
				...globals.worker,
			},
		},
	},
);
