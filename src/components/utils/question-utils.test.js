import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getConditionalAnswer, getConditionalFieldName } from './question-utils.js';

describe('getConditionalFieldName', () => {
	it('returns conditional field name given parent and child name', () => {
		assert.strictEqual(getConditionalFieldName('parent', 'child'), 'parent_child');
	});
});

describe('getConditionalAnswer', () => {
	const setup = () => {
		const answers = {
			field: 'yes',
			otherField: 'yes',
			field_conditional: 'test'
		};
		const question = {
			fieldName: 'field',
			options: [
				{
					value: 'yes',
					conditional: {
						fieldName: 'conditional'
					}
				},
				{
					value: 'no'
				}
			]
		};
		return { answers, question };
	};

	it('returns conditional field value when it exists', () => {
		const { answers, question } = setup();
		const expectedResult = { yes: 'test' };
		assert.deepStrictEqual(getConditionalAnswer(answers, question, 'yes'), expectedResult);
	});

	it('returns null when option chosen does not have conditional value', () => {
		const { answers, question } = setup();
		answers.field = 'no';
		assert.strictEqual(getConditionalAnswer(answers, question, 'no'), null);
	});

	it('returns null when question does not have conditional value', () => {
		const { answers, question } = setup();
		delete question.options[0].conditional;
		assert.strictEqual(getConditionalAnswer(answers, question, 'yes'), null);
	});

	it('returns null when answer is null', () => {
		const { answers, question } = setup();
		assert.strictEqual(getConditionalAnswer(answers, question, null), null);
	});

	it('returns null when answer is empty string', () => {
		const { answers, question } = setup();
		assert.strictEqual(getConditionalAnswer(answers, question, ''), null);
	});

	it('returns null when question has no options', () => {
		const { answers, question } = setup();
		delete question.options;
		assert.strictEqual(getConditionalAnswer(answers, question, 'yes'), null);
	});

	describe('multi-value answers (checkboxes)', () => {
		const setupMultiValue = () => {
			const answers = {
				field: 'a,b,c',
				field_detailsA: 'details for A',
				field_detailsC: 'details for C'
			};
			const question = {
				fieldName: 'field',
				options: [
					{
						value: 'a',
						conditional: {
							fieldName: 'detailsA'
						}
					},
					{
						value: 'b'
					},
					{
						value: 'c',
						conditional: {
							fieldName: 'detailsC'
						}
					}
				]
			};
			return { answers, question };
		};

		it('returns object with conditional values for multiple selected options', () => {
			const { answers, question } = setupMultiValue();
			const result = getConditionalAnswer(answers, question, 'a,c');
			assert.deepStrictEqual(result, {
				a: 'details for A',
				c: 'details for C'
			});
		});

		it('returns object with only options that have conditional values', () => {
			const { answers, question } = setupMultiValue();
			const result = getConditionalAnswer(answers, question, 'a,b');
			assert.deepStrictEqual(result, {
				a: 'details for A'
			});
		});

		it('returns null when no selected options have conditional values', () => {
			const { answers, question } = setupMultiValue();
			const result = getConditionalAnswer(answers, question, 'b');
			assert.strictEqual(result, null);
		});

		it('returns null when conditional fields have no values', () => {
			const { answers, question } = setupMultiValue();
			delete answers.field_detailsA;
			delete answers.field_detailsC;
			const result = getConditionalAnswer(answers, question, 'a,c');
			assert.strictEqual(result, null);
		});

		it('handles whitespace in comma-separated values', () => {
			const { answers, question } = setupMultiValue();
			const result = getConditionalAnswer(answers, question, 'a , c');
			assert.deepStrictEqual(result, {
				a: 'details for A',
				c: 'details for C'
			});
		});
	});
});
