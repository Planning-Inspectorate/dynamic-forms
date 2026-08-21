import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import MultiFieldInputQuestion from './question.js';
import { Journey } from '#journey';

const TITLE = 'title';
const QUESTION = 'Question?';
const FIELDNAME = 'field-name';
const VALIDATORS = [1, 2];
const HTML = '/path/to/html.njk';
const HINT = 'hint';
const INPUTFIELDS = [{ fieldName: 'testField1' }, { fieldName: 'testField2' }];

function createMultiFieldInputQuestion(
	title = TITLE,
	question = QUESTION,
	fieldName = FIELDNAME,
	validators = VALIDATORS,
	html = HTML,
	hint = HINT,
	inputFields = INPUTFIELDS
) {
	return new MultiFieldInputQuestion({
		title: title,
		question: question,
		fieldName: fieldName,
		validators: validators,
		html: html,
		hint: hint,
		inputFields: inputFields
	});
}

describe('./src/dynamic-forms/components/multi-field-input/question.js', () => {
	it('should create', () => {
		const testQuestion = createMultiFieldInputQuestion();

		assert.strictEqual(testQuestion.title, TITLE);
		assert.strictEqual(testQuestion.question, QUESTION);
		assert.strictEqual(testQuestion.fieldName, FIELDNAME);
		assert.strictEqual(testQuestion.viewFolder, 'multi-field-input');
		assert.strictEqual(testQuestion.validators, VALIDATORS);
		assert.strictEqual(testQuestion.html, HTML);
		assert.strictEqual(testQuestion.hint, HINT);
		assert.strictEqual(testQuestion.inputFields, INPUTFIELDS);
	});

	it('should default capitaliseAnswer to false', () => {
		const testQuestion = createMultiFieldInputQuestion();
		assert.strictEqual(testQuestion.capitaliseAnswer, false);
	});

	it('should throw error if no inputFields parameter is passed to the constructor', () => {
		assert.throws(() => {
			createMultiFieldInputQuestion(TITLE, QUESTION, FIELDNAME, VALIDATORS, HTML, HINT, null);
		}, new Error('inputFields are mandatory'));
	});

	describe('bodyFieldNames', () => {
		it('should return field names from all inputFields', () => {
			const testQuestion = createMultiFieldInputQuestion();
			assert.deepStrictEqual(testQuestion.bodyFieldNames, ['testField1', 'testField2']);
		});
	});

	describe('prepQuestionForRendering', () => {
		it('should call super and set inputFields', () => {
			const question = createMultiFieldInputQuestion();

			const journey = {
				response: {
					answers: {}
				},
				getBackLink: () => {
					return 'back';
				}
			};

			const customViewData = { hello: 'hi' };

			const result = question.prepQuestionForRendering({}, journey, customViewData);

			assert.strictEqual(result.question?.fieldName, FIELDNAME);
			assert.strictEqual(result.question?.value[0].fieldName, INPUTFIELDS[0].fieldName);
			assert.strictEqual(result.question?.value[1].fieldName, INPUTFIELDS[1].fieldName);
			assert.strictEqual(result.hello, 'hi');
		});
		it('should set inputFields with values from payload if provided', () => {
			const question = createMultiFieldInputQuestion();
			const journey = {
				response: {
					answers: {}
				},
				getBackLink: () => {
					return 'back';
				}
			};
			const payload = {
				testField1: 'payloadValue1',
				testField2: 'payloadValue2'
			};

			const result = question.prepQuestionForRendering({}, journey, {}, payload);

			assert.strictEqual(result.question?.value[0].value, 'payloadValue1');
			assert.strictEqual(result.question?.value[1].value, 'payloadValue2');
		});
		it('should set inputFields with values from journey response if payload is not provided', () => {
			const question = createMultiFieldInputQuestion();
			const journey = {
				response: {
					answers: {
						testField1: 'responseValue1',
						testField2: 'responseValue2'
					}
				},
				getBackLink: () => {
					return 'back';
				}
			};

			const result = question.prepQuestionForRendering({}, journey, {});

			assert.strictEqual(result.question?.value[0].value, 'responseValue1');
			assert.strictEqual(result.question?.value[1].value, 'responseValue2');
		});
		it('should set inputFields with formatted values from journey response if formatTextFunction is provided', () => {
			const formatTextFunction = (value) => `Formatted: ${value}`;
			const question = createMultiFieldInputQuestion(TITLE, QUESTION, FIELDNAME, VALIDATORS, HTML, HINT, [
				{ fieldName: 'testField1', formatTextFunction },
				{ fieldName: 'testField2', formatTextFunction }
			]);
			const journey = {
				response: {
					answers: {
						testField1: 'responseValue1',
						testField2: 'responseValue2'
					}
				},
				getBackLink: () => {
					return 'back';
				}
			};

			const result = question.prepQuestionForRendering({}, journey, {});

			assert.strictEqual(result.question?.value[0].value, 'Formatted: responseValue1');
			assert.strictEqual(result.question?.value[1].value, 'Formatted: responseValue2');
		});
	});

	describe('getDataToSave', () => {
		it('should return values for all completed fields', async () => {
			const question = createMultiFieldInputQuestion();

			const testRequest = {
				body: {
					testField1: 'testInput',
					testField2: 'more test input',
					notATestField: 'we should not see this'
				}
			};

			const journeyResponse = {
				answers: {}
			};

			const expectedResponseToSave = {
				answers: {
					testField1: 'testInput',
					testField2: 'more test input'
				}
			};

			const result = await question.getDataToSave(testRequest, journeyResponse);

			assert.deepStrictEqual(result, expectedResponseToSave);
		});
		it('should trim whitespace from input values before saving', async () => {
			const question = createMultiFieldInputQuestion();

			const testRequest = {
				body: {
					testField1: '  testInput  ',
					testField2: '  more test input  '
				}
			};

			const journeyResponse = {
				answers: {}
			};

			const expectedResponseToSave = {
				answers: {
					testField1: 'testInput',
					testField2: 'more test input'
				}
			};

			const result = await question.getDataToSave(testRequest, journeyResponse);

			assert.deepStrictEqual(result, expectedResponseToSave);
		});
		it('should handle missing fields in the request body gracefully', async () => {
			const question = createMultiFieldInputQuestion();

			const testRequest = {
				body: {}
			};

			const journeyResponse = {
				answers: {}
			};

			const expectedResponseToSave = {
				answers: {
					testField1: undefined,
					testField2: undefined
				}
			};

			const result = await question.getDataToSave(testRequest, journeyResponse);

			assert.deepStrictEqual(result, expectedResponseToSave);
		});
	});

	describe('formatAnswerForSummary', () => {
		it('should return formatted answer', async () => {
			const question = createMultiFieldInputQuestion();
			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'planning-permission',
						testField2: 'Test User'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const expectedResult = [
				{
					action: {
						href: 'base/cases/create-a-case/check-your-answers',
						text: 'Change',
						visuallyHiddenText: 'Question?'
					},
					key: 'title',
					value: 'planning-permission<br>Test User'
				}
			];

			const result = question.formatAnswerForSummary('questions', journey);

			assert.deepStrictEqual(result, expectedResult);
		});
		it('should return an empty string as answer text for unanswered multi field question', async () => {
			const question = createMultiFieldInputQuestion();
			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: null,
						testField2: null
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const expectedResult = [
				{
					action: {
						href: 'base/cases/create-a-case/check-your-answers',
						text: 'Answer',
						visuallyHiddenText: 'Question?'
					},
					key: 'title',
					value: ''
				}
			];

			const result = question.formatAnswerForSummary('questions', journey);

			assert.deepStrictEqual(result, expectedResult);
		});
		it('should return not started text for undefined multi field question', async () => {
			const question = createMultiFieldInputQuestion();
			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: undefined,
						testField2: undefined
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const expectedResult = [
				{
					action: {
						href: 'base/cases/create-a-case/check-your-answers',
						text: 'Answer',
						visuallyHiddenText: 'Question?'
					},
					key: 'title',
					value: 'Not started'
				}
			];

			const result = question.formatAnswerForSummary('questions', journey);

			assert.deepStrictEqual(result, expectedResult);
		});
		it('should return escaped text with newlines (no <br>) when isInManageListSection is true', () => {
			const question = createMultiFieldInputQuestion();

			question.isInManageListSection = true;

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Line 1',
						testField2: 'Line & 2'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const expectedValue = 'Line 1\nLine &amp; 2';

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, expectedValue);
			assert.strictEqual(result[0].value.includes('<br>'), false);
		});
		it('should apply formatSummaryValue when provided', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: INPUTFIELDS,
				formatSummaryValue: ({ formattedAnswer }) => `Custom: ${formattedAnswer}`
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Value 1',
						testField2: 'Value 2'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, 'Custom: Value 1<br>Value 2');
		});
		it('should apply formatSummaryValue on input fields with context (not escaped, not in form view)', () => {
			// formatSummaryValue receives full context and output is not escaped
			const formatSummaryValue = ({ answer }) => `<strong>${answer}</strong>`;
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [
					{ fieldName: 'testField1', formatSummaryValue, formatJoinString: '<br>' },
					{ fieldName: 'testField2', formatSummaryValue, formatJoinString: '<br>' }
				]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Value 1',
						testField2: 'Value 2'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			// formatSummaryValue should be applied in summary (with HTML not escaped)
			const summaryResult = question.formatAnswerForSummary('questions', journey);
			assert.strictEqual(summaryResult[0].value, '<strong>Value 1</strong><br><strong>Value 2</strong>');

			// formatSummaryValue should NOT be applied in view model (form inputs)
			const viewResult = question.prepQuestionForRendering({}, journey, {});
			assert.strictEqual(viewResult.question?.value[0].value, 'Value 1');
			assert.strictEqual(viewResult.question?.value[1].value, 'Value 2');
		});
		it('should pass full context to formatSummaryValue including journey and field', () => {
			const formatSummaryValue = mock.fn((ctx) => ctx.answer);
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [{ fieldName: 'testField1', formatSummaryValue }]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Test Value'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			question.formatAnswerForSummary('test-section', journey);

			assert.strictEqual(formatSummaryValue.mock.callCount(), 1);
			const capturedContext = formatSummaryValue.mock.calls[0].arguments[0];
			assert.strictEqual(capturedContext.answer, 'Test Value');
			assert.strictEqual(capturedContext.formattedAnswer, 'Test Value');
			assert.strictEqual(capturedContext.question, question);
			assert.strictEqual(capturedContext.journey, journey);
			assert.strictEqual(capturedContext.sectionSegment, 'test-section');
			assert.strictEqual(capturedContext.field.fieldName, 'testField1');
		});
		it('should apply formatPrefix to each field value in summary', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [
					{ fieldName: 'testField1', formatPrefix: 'Name: ' },
					{ fieldName: 'testField2', formatPrefix: 'Email: ' }
				]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'John Doe',
						testField2: 'john@example.com'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, 'Name: John Doe<br>Email: john@example.com');
		});
		it('should only include answered fields in summary (partial answers)', () => {
			const question = createMultiFieldInputQuestion();

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Answered value',
						testField2: null
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			// Only the answered field should be included
			assert.strictEqual(result[0].value, 'Answered value');
		});
		it('should include falsy-but-valid answers such as false and 0 in the summary', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [{ fieldName: 'testField1' }, { fieldName: 'testField2' }]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: false,
						testField2: 0
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, 'false<br>0');
		});
		it('should exclude fields with an empty string answer from the summary', () => {
			const question = createMultiFieldInputQuestion();

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Answered value',
						testField2: ''
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			// Only the non-empty field should be included, no trailing join string
			assert.strictEqual(result[0].value, 'Answered value');
		});
		it('should escape HTML characters in field values by default', () => {
			const question = createMultiFieldInputQuestion();

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: '<script>alert("xss")</script>',
						testField2: 'Safe & Sound'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;<br>Safe &amp; Sound');
		});
		it('should use default <br> join string when not in ManageListSection', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [
					{ fieldName: 'testField1' }, // no formatJoinString specified
					{ fieldName: 'testField2' }
				]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Value 1',
						testField2: 'Value 2'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			// Default join string should be <br> (not \n)
			assert.ok(result[0].value.includes('<br>'));
			assert.strictEqual(result[0].value, 'Value 1<br>Value 2');
		});
		it('should use custom formatJoinString when provided', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: [
					{ fieldName: 'testField1', formatJoinString: ' - ' },
					{ fieldName: 'testField2', formatJoinString: '' }
				]
			});

			const journey = new Journey({
				journeyId: 'TEST',
				makeBaseUrl: () => 'base',
				taskListUrl: 'cases/create-a-case/check-your-answers',
				response: {
					answers: {
						testField1: 'Value 1',
						testField2: 'Value 2'
					}
				},
				journeyTemplate: 'mock template',
				taskListTemplate: 'mock path',
				journeyTitle: 'mock title',
				sections: []
			});

			const result = question.formatAnswerForSummary('questions', journey);

			assert.strictEqual(result[0].value, 'Value 1 - Value 2');
		});
	});
	describe('formatAnswer', () => {
		it('should return notStartedText for null', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer(null), 'Not started');
		});
		it('should return notStartedText for undefined', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer(undefined), 'Not started');
		});
		it('should return empty string for empty string', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer(''), '');
		});
		it('should escape HTML and convert newlines to <br>', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer('Line 1\nLine <2>'), 'Line 1<br>Line &lt;2&gt;');
		});
		it('should not apply nl2br when isInManageListSection is true', () => {
			const question = createMultiFieldInputQuestion();
			question.isInManageListSection = true;
			assert.strictEqual(question.formatAnswer('Line 1\nLine 2'), 'Line 1\nLine 2');
		});
		it('should capitalise answer when capitaliseAnswer is true', () => {
			const question = new MultiFieldInputQuestion({
				title: TITLE,
				question: QUESTION,
				fieldName: FIELDNAME,
				inputFields: INPUTFIELDS,
				capitaliseAnswer: true
			});
			assert.strictEqual(question.formatAnswer('hello world'), 'Hello world');
		});
		it('should not capitalise answer when capitaliseAnswer is false (default)', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer('hello world'), 'hello world');
		});
		it('should coerce non-string values to string before formatting', () => {
			const question = createMultiFieldInputQuestion();
			assert.strictEqual(question.formatAnswer(123), '123');
			assert.strictEqual(question.formatAnswer(true), 'true');
		});
	});
});
