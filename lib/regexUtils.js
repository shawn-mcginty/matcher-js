'use strict';

const getCaptureTokenRegex = () => new RegExp(/(\%\{\d+(?:S\d+|G)?\})/g);
const getBasicTokenRegex = () => new RegExp(/(\%\{\d+\})/g);
const getSpaceLimitTokenRegex = () => new RegExp(/(\%\{\d+(?:S(\d+))\})/g);
const getGreedyTokenRegex = () => new RegExp(/(\%\{\d+(?:G(\d+))\})/g);

const escapeRegexTokens = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

const hasNoTokens = pattern => !(getCaptureTokenRegex().test(pattern));

const basicTokenRegexString = '(.+)';

exports.createRegexFromPattern = (pattern) => {
	if (!pattern || pattern === '') {
		return Promise.reject('Invalid pattern!');
	}

	if (hasNoTokens(pattern)) {
		return Promise.resolve(escapeRegexTokens(pattern))
			.then(escapedPattern => new RegExp(`^(${escapedPattern})$`, 'g'));
	}

	return Promise.resolve(new RegExp(`^${replaceCaptureTokens(pattern)}$`, 'g'));
};

const replaceCaptureTokens = (pattern, index) => {
	index = index || 0; //default to 0 if no index is passed in

	const searchResults = getCaptureTokenRegex().exec(pattern);

	if (searchResults === null) {
		return pattern;
	}

	return searchResults.filter(removeFirstItem)
		.reduce((_, token) => {
			const literalsLength = searchResults.index - index;
			const literals = pattern.substr(index, literalsLength);
			const regexLiterals = `(${escapeRegexTokens(literals)})`;
			const updatedPattern = pattern.replace(literals, regexLiterals)
				.replace(token, getRegexStringFromToken(token));
			return replaceCaptureTokens(updatedPattern, regexLiterals.length + getRegexStringFromToken(token).length);
		}, null);
};

const removeFirstItem = (_, index) => index > 0;

const getRegexStringFromToken = (token) => {
	if (getBasicTokenRegex().test(token)) {
		return basicTokenRegexString;
	} else if (getSpaceLimitTokenRegex().test(token)) {
		return createSpaceLimitRegexString(token);
	} else if (getGreedyTokenRegex().test(token)) {
		return basicTokenRegexString;
	}

	return '';
};

const createSpaceLimitRegexString = (token) => {
	const regex = getSpaceLimitTokenRegex().exec(token);
	const numberOfSpaces = regex[2];
	let regexString = '(\\S+';

	for (let i = 0; i < numberOfSpaces; i++) {
		regexString = `${regexString} \\S+`;
	}
	regexString = `${regexString})`;
	return regexString
}

