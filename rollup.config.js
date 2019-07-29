import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

const mode = process.env.BUILD === 'production' ? 'production' : 'development';

const plugins = [
	json(),
	resolve({
		preferBuiltins: false,
	}),
];

if (mode === 'production') {
	plugins.push(compiler());
}

export default [
	{
		input: './background.js',
		output: {
			file: './dist/background.bundle.js',
			format: 'iife',
			name: 'localSheriff',
			sourcemap: true,
		},
		plugins,
	},
	{
		input: './scripts/content-script.js',
		output: {
			file: './dist/content-script.bundle.js',
			format: 'iife',
			name: 'localSheriff',
			sourcemap: true,
		},
		plugins,
	},
];
