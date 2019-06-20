import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

const plugins = [
	json(),
	resolve({
		preferBuiltins: false,
	}),
	commonjs(),
];

export default [
	{
		input: './background.js',
		output: {
			file: 'background.bundle.js',
			format: 'iife',
			name: 'localSheriff',
		},
		plugins,
	},
	{
		input: './scripts/content-script.js',
		output: {
			file: 'content-script.bundle.js',
			format: 'iife',
			name: 'localSheriff',
		},
		plugins,
	},
];
