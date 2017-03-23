'use strict';

const assert = require('chai').assert;
const expect = require('chai').expect;

const regexUtils = require('../../lib/regexUtils.js');

describe('regexUtils', () => {
	it('is defined', () => {
		assert.isDefined(regexUtils);
	});

	describe('createRegexFromPattern()', () => {
		it('is defined', () => {
			assert.isDefined(regexUtils.createRegexFromPattern);
		});

		it('returns a Promise', () => {
			const promise = regexUtils.createRegexFromPattern();
			expect(promise).is.instanceOf(Promise);
		});

		it('rejects on null input', () => {
			return regexUtils.createRegexFromPattern(null)
				.catch((err) => {
					expect(err).to.equal('Invalid pattern!');
				});
		});

		it('rejects on empty string input', () => {
			return regexUtils.createRegexFromPattern('')
				.catch((err) => {
					expect(err).to.equal('Invalid pattern!');
				});
		});

		it('rejects on undefined input', () => {
			return regexUtils.createRegexFromPattern()
				.catch((err) => {
					expect(err).to.equal('Invalid pattern!');
				});
		});

		it('resolves to a regexp that matches literals when no tokens are given', () => {
			return regexUtils.createRegexFromPattern('match only this.')
				.then((regex) => {
					expect(regex.toString()).to.equal('/^(match only this\\.)$/g');
					expect(regex.test('match only this.')).to.equal(true);
					expect(regex.test('match only thisx')).to.equal(false);
				});
		});

		it('ignores invalid capture tokens', () => {
			return regexUtils.createRegexFromPattern('match only %{0D}')
				.then((regex) => {
					expect(regex.test('match only %{0D}')).to.equal(true);
					expect(regex.test('match only foo')).to.equal(false);
				});
		});

		it('returns Promise<RegExp> when given one good capture token', () => {
			return regexUtils.createRegexFromPattern('match only %{0}')
				.then((regex) => {
					expect(regex).is.instanceOf(RegExp);
					expect(regex.test('match only some stuff')).to.equal(true);
					expect(regex.test('don\'t match only this stuff')).to.equal(false);
				});
		});

		it('returns Promise<RegExp> when given multiple good basic capture tokens', () => {
			return regexUtils.createRegexFromPattern('foo %{0} is a %{1}')
				.then((regex) => {
					expect(regex).is.instanceOf(RegExp);
					expect(regex.test('foo blah is a very big boat')).to.equal(true);
					expect(regex.test('foo blah is bar')).to.equal(false);
				});
		});

		it('returns Promise<RegExp> when given one good space-limit capture token', () => {
			return regexUtils.createRegexFromPattern('foo %{0} is a %{1S0}')
				.then((regex) => {
					expect(regex).is.instanceOf(RegExp);
					expect(regex.test('foo blah is a bar')).to.equal(true);
					expect(regex.test('foo blah is a very big boat')).to.equal(false);
				});
		});

		it('works with more than 0 allowed spaces', () => {
			return regexUtils.createRegexFromPattern('the %{0S1} %{1} ran away')
				.then((regex) => {
					expect(regex).is.instanceOf(RegExp);
					expect(regex.test('the big brown fox ran away')).to.equal(true);
					expect(regex.test('the big brown crazy fox ran away')).to.equal(false);
				})
		});

		it('works with one greedy capture token', () => {
			return regexUtils.createRegexFromPattern('bar %{0G} foo %{1}')
				.then((regex) => {
					expect(regex).is.instanceOf(RegExp);
					expect(regex.test('bar foo bar foo bar foo bar foo')).to.equal(true);
				});
		});
	});
});