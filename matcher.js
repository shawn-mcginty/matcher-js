'use strict';

const readline = require('readline');

const regexUtils = require('./lib/regexUtils');

let inputData = new Buffer('');
const pattern = process.argv[2];

if (!pattern) {
	process.stdout.write('No matching pattern provided!\n');
	process.exit(-1);
}

regexUtils.createRegexFromPattern(pattern)
	.then((matcher) => {
		readline.createInterface({
			input: process.stdin,
		}).on('line', (line) => {
			if (matcher.test(line)) {
				process.stdout.write(`${line}\n`);
			}
		});
	}).catch((err) => {
		console.error(err);
		process.exit(-1);
	});
