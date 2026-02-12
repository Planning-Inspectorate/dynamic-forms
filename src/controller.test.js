import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';
import { list, question, buildSave } from './controller.js';

import { Journey } from './journey/journey.js';
import { SECTION_STATUS } from './section.js';

import { mockReq, mockRes } from '#test/utils/utils.js';
import { BOOLEAN_OPTIONS } from '#src/components/boolean/question.js';
import { MANAGE_LIST_ACTIONS } from '#src/components/manage-list/manage-list-actions.js';

const res = mockRes();
const mockBaseUrl = '/manage-appeals/questionnaire';
const mockRef = '123456';
const mockTemplateUrl = 'template.njk';
const mockListingPath = 'mockListingPath.njk';
const mockJourneyTitle = 'Mock Manage Appeals';
const mockAnswer = 'Not started';
const sections = [
	{
		name: 'Section 1',
		segment: 'segment-1',
		getStatus: () => {
			return SECTION_STATUS.COMPLETE;
		},
		isComplete: () => {
			return true;
		},
		questions: [
			{
				title: 'Title 1a',
				question: 'Why?',
				taskList: true,
				fieldName: 'title-1a',
				shouldDisplay: () => true,
				formatAnswerForSummary: mock.fn()
			},
			{
				title: 'Title 1b',
				question: 'Who?',
				taskList: false,
				fieldName: 'title-1b',
				shouldDisplay: () => true,
				formatAnswerForSummary: mock.fn(() => [
					{
						key: 'Title 1b',
						value: mockAnswer,
						action: {
							href: '/manage-appeals/questionnaire/123456/segment-1/title-1b',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						}
					}
				])
			}
		]
	},
	{
		name: 'Section 2',
		segment: 'segment-2',
		getStatus: () => {
			return SECTION_STATUS.IN_PROGRESS;
		},
		isComplete: () => {
			return true;
		},
		questions: [
			{
				title: 'Title 2a',
				question: 'How?',
				taskList: true,
				fieldName: 'title-2a',
				shouldDisplay: () => true,
				formatAnswerForSummary: () => [
					{
						key: 'Title 2a',
						value: mockAnswer,
						action: {
							href: '/manage-appeals/questionnaire/123456/segment-2/title-2a',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						}
					}
				]
			},
			{
				title: 'Title 2b',
				question: 'What?',
				taskList: true,
				fieldName: 'title-2b',
				shouldDisplay: () => true,
				formatAnswerForSummary: () => [
					{
						key: 'Title 2b',
						value: mockAnswer,
						action: {
							href: '/manage-appeals/questionnaire/123456/segment-2/title-2b',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						}
					}
				]
			}
		]
	},
	{
		name: 'Section 3',
		segment: 'segment-3',
		getStatus: () => {
			return SECTION_STATUS.NOT_STARTED;
		},
		isComplete: mock.fn(),
		questions: [
			{
				title: 'Title 3a',
				question: 'When?',
				taskList: false,
				fieldName: 'title-3a',
				shouldDisplay: () => true,
				formatAnswerForSummary: () => [
					{
						key: 'Title 3a',
						value: mockAnswer,
						action: {
							href: '/manage-appeals/questionnaire/123456/segment-3/title-3a',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						}
					}
				]
			},
			{
				title: 'Title 3b',
				question: 'Really?',
				taskList: true,
				fieldName: 'title-3b',
				shouldDisplay: () => true,
				formatAnswerForSummary: () => [
					{
						key: 'Title 3b',
						value: mockAnswer,
						action: {
							href: '/manage-appeals/questionnaire/123456/segment-3/title-3b',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						}
					}
				]
			}
		]
	}
];

const journeyParams = {
	sections,
	journeyId: 'TEST',
	referenceId: 'REF',
	taskListUrl: 'task-list',
	makeBaseUrl: () => `${mockBaseUrl}/${mockRef}`,
	journeyTemplate: mockTemplateUrl,
	taskListTemplate: mockListingPath,
	journeyTitle: mockJourneyTitle
};

const mockResponse = {
	referenceId: mockRef,
	answers: {
		'title-1a': 'yes',
		'title-2a': null,
		'title-2b': undefined
	}
};

let mockJourney;
let mockSummaryListData;

const sampleQuestionObj = {
	fieldName: 'sampleFieldName',
	renderAction: mock.fn(),
	getDataToSave: mock.fn(),
	checkForValidationErrors: mock.fn(),
	checkForSavingErrors: mock.fn(),
	toViewModel: mock.fn(),
	prepQuestionForRendering: mock.fn(),
	formatAnswerForSummary: mock.fn(() => [mockAnswer]),
	viewFolder: 'sampleType'
};

const mockSection = {
	name: '123',
	segment: 'test'
};

describe('dynamic-form/controller', () => {
	let req;
	beforeEach(() => {
		res.locals.journeyResponse = {};
		mockJourney = new Journey({ response: mockResponse, ...journeyParams });
		res.locals.journey = mockJourney;
		mockJourney.sections[0].questions[0].formatAnswerForSummary.mock.mockImplementation(() => [
			{
				key: 'Title 1a',
				value: mockAnswer,
				action: {
					href: '/manage-appeals/questionnaire/123456/segment-1/title-1a',
					text: 'Answer',
					visuallyHiddenText: 'Answer'
				}
			}
		]);
		mockJourney.sections[2].isComplete = mock.fn(() => false);

		mockSummaryListData = _getmockSummaryListData(mockJourney);
		req = mockReq(null);
	});

	describe('list', () => {
		it('should render the view correctly', async () => {
			res.locals.journeyResponse.referenceId = mockRef;
			const appeal = { a: 1, caseReference: 2 };

			const pageCaption = `Appeal ${appeal.caseReference}`;
			await list(req, res, pageCaption, { appeal });

			const mockFn = res.render.mock;
			assert.strictEqual(mockFn.callCount(), 1);
			assert.deepStrictEqual(mockFn.calls[0].arguments, [
				'components/task-list/index',
				{
					appeal,
					summaryListData: mockSummaryListData,
					layoutTemplate: mockListingPath,
					journeyComplete: false,
					pageCaption: pageCaption,
					journeyTitle: mockJourneyTitle
				}
			]);
		});
		it('support array of actions', async () => {
			const mockFn = res.render.mock;
			mockFn.resetCalls();
			mockJourney.sections[0].questions[0].formatAnswerForSummary.mock.mockImplementation(() => [
				{
					key: 'Title 1a',
					value: mockAnswer,
					action: [
						{
							href: '/manage-appeals/questionnaire/123456/segment-1/title-1a',
							text: 'Answer',
							visuallyHiddenText: 'Answer'
						},
						{
							href: '/manage-appeals/questionnaire/123456/segment-1/title-1a/edit',
							text: 'Edit',
							visuallyHiddenText: 'Edit'
						}
					]
				}
			]);
			res.locals.journeyResponse.referenceId = mockRef;
			const appeal = { a: 1, caseReference: 2 };

			const pageCaption = `Appeal ${appeal.caseReference}`;
			await list(req, res, pageCaption, { appeal });

			mockSummaryListData.sections[0].list.rows[0].actions.items.push({
				href: '/manage-appeals/questionnaire/123456/segment-1/title-1a/edit',
				text: 'Edit',
				visuallyHiddenText: 'Edit'
			});

			assert.strictEqual(mockFn.callCount(), 1);
			assert.deepStrictEqual(mockFn.calls[0].arguments, [
				'components/task-list/index',
				{
					appeal,
					summaryListData: mockSummaryListData,
					layoutTemplate: mockListingPath,
					journeyComplete: false,
					pageCaption: pageCaption,
					journeyTitle: mockJourneyTitle
				}
			]);
		});

		it('should format answer summary including conditional answer', async () => {
			const mockFn = mockJourney.sections[0].questions[0].formatAnswerForSummary.mock;
			mockFn.resetCalls();
			res.locals.journeyResponse.referenceId = mockRef;

			await list(req, res);

			const expectedAnswer = {
				value: 'yes',
				conditional: 'test'
			};
			assert.strictEqual(mockFn.callCount(), 1);
			const args = mockFn.calls[0].arguments;
			assert.strictEqual(args[0], mockJourney.sections[0].segment);
			assert.strictEqual(args[2], expectedAnswer.value);
		});
	});

	describe('question', () => {
		it('should redirect if question is not found', async () => {
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => null);

			await question(req, res);

			assert.deepStrictEqual(res.redirect.mock.calls[0].arguments, [mockJourney.taskListUrl]);
		});

		it('should use custom action if renderAction is defined', async () => {
			mockJourney.getSection = mock.fn();
			mockJourney.getSection.mock.mockImplementationOnce(() => {
				return {};
			});
			mockJourney.getQuestionByParams = mock.fn(() => sampleQuestionObj);
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObj);
			sampleQuestionObj.renderAction = mock.fn();

			await question(req, res);

			assert.strictEqual(sampleQuestionObj.renderAction.mock.callCount(), 1);
			assert.deepStrictEqual(sampleQuestionObj.renderAction.mock.calls[0].arguments, [res, undefined]);
		});

		it('should render the question template', async () => {
			sampleQuestionObj.renderAction.mock.resetCalls();
			sampleQuestionObj.toViewModel.mock.resetCalls();
			req.params.referenceId = mockRef;
			const mockAnswer = 'sampleAnswer';
			const mockBackLink = 'back';
			const mockQuestionRendering = 'test';

			sampleQuestionObj.toViewModel.mock.mockImplementationOnce(() => mockQuestionRendering);

			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObj);
			mockJourney.response.answers.sampleFieldName = mockAnswer;
			mockJourney.getNextQuestionUrl = mock.fn(() => mockBackLink);
			mockJourney.getSection = mock.fn(() => mockSection);

			await question(req, res);

			assert.strictEqual(sampleQuestionObj.renderAction.mock.callCount(), 1);
			assert.deepStrictEqual(sampleQuestionObj.renderAction.mock.calls[0].arguments, [res, mockQuestionRendering]);
			assert.strictEqual(sampleQuestionObj.toViewModel.mock.callCount(), 1);
			const args = sampleQuestionObj.toViewModel.mock.calls[0].arguments[0];
			assert.ok(args);
			assert.ok(args?.customViewData?.originalUrl);
			assert.strictEqual(args?.customViewData?.originalUrl, req.originalUrl);
		});

		it('should redirect to tasklist when manage list action is remove and journey response has no answers', async () => {
			res.redirect.mock.resetCalls();

			sampleQuestionObj.isManageListQuestion = true;
			sampleQuestionObj.renderConfirmationAction = mock.fn();

			req.params = {
				referenceId: mockRef,
				section: mockSection.name,
				question: sampleQuestionObj.fieldName,
				manageListAction: MANAGE_LIST_ACTIONS.REMOVE
			};
			const mockAnswer = undefined;
			const mockBackLink = 'back';
			const mockQuestionRendering = 'test';

			sampleQuestionObj.toViewModel.mock.mockImplementationOnce(() => mockQuestionRendering);
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementation(() => sampleQuestionObj);
			mockJourney.response.answers = mockAnswer;
			mockJourney.getNextQuestionUrl = mock.fn(() => mockBackLink);
			mockJourney.getSection = mock.fn(() => mockSection);

			await question(req, res);

			assert.strictEqual(res.redirect.mock.callCount(), 1);
			assert.deepStrictEqual(res.redirect.mock.calls[0].arguments, [mockJourney.taskListUrl]);
		});

		it('should redirect to tasklist when manage list action is remove and the manage list answer is undefined', async () => {
			res.redirect.mock.resetCalls();

			sampleQuestionObj.isManageListQuestion = true;
			sampleQuestionObj.renderConfirmationAction = mock.fn();

			req.params = {
				referenceId: mockRef,
				section: mockSection.name,
				question: sampleQuestionObj.fieldName,
				manageListAction: MANAGE_LIST_ACTIONS.REMOVE
			};
			const mockAnswer = {
				wrongFieldName: 'Some value'
			};
			const mockBackLink = 'back';
			const mockQuestionRendering = 'test';

			sampleQuestionObj.toViewModel.mock.mockImplementationOnce(() => mockQuestionRendering);
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementation(() => sampleQuestionObj);
			mockJourney.response.answers = mockAnswer;
			mockJourney.getNextQuestionUrl = mock.fn(() => mockBackLink);
			mockJourney.getSection = mock.fn(() => mockSection);

			await question(req, res);

			assert.strictEqual(res.redirect.mock.callCount(), 1);
			assert.deepStrictEqual(res.redirect.mock.calls[0].arguments, [mockJourney.taskListUrl]);
		});

		it('should redirect to tasklist when manage list action is remove and the manage list answer is not an array', async () => {
			res.redirect.mock.resetCalls();

			sampleQuestionObj.isManageListQuestion = true;
			sampleQuestionObj.renderConfirmationAction = mock.fn();

			req.params = {
				referenceId: mockRef,
				section: mockSection.name,
				question: sampleQuestionObj.fieldName,
				manageListAction: MANAGE_LIST_ACTIONS.REMOVE
			};
			const mockAnswer = {
				sampleFieldName: 'not-an-array'
			};
			const mockBackLink = 'back';
			const mockQuestionRendering = 'test';

			sampleQuestionObj.toViewModel.mock.mockImplementationOnce(() => mockQuestionRendering);
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementation(() => sampleQuestionObj);
			mockJourney.response.answers = mockAnswer;
			mockJourney.getNextQuestionUrl = mock.fn(() => mockBackLink);
			mockJourney.getSection = mock.fn(() => mockSection);

			await question(req, res);

			assert.strictEqual(res.redirect.mock.callCount(), 1);
			assert.deepStrictEqual(res.redirect.mock.calls[0].arguments, [mockJourney.taskListUrl]);
		});

		it('should render the confirmation page when manage list action is remove and the question has a renderConfirmationAction function', async () => {
			res.redirect.mock.resetCalls();

			sampleQuestionObj.isManageListQuestion = true;

			req.params = {
				referenceId: mockRef,
				section: mockSection.name,
				question: sampleQuestionObj.fieldName,
				manageListAction: MANAGE_LIST_ACTIONS.REMOVE,
				manageListItemId: 'item-id-1'
			};
			const mockAnswer = {
				sampleFieldName: [{ id: 'item-id-1', name: 'Item 1' }]
			};
			const mockBackLink = 'back';
			const mockQuestionRendering = 'test';

			sampleQuestionObj.toViewModel.mock.mockImplementationOnce(() => mockQuestionRendering);
			sampleQuestionObj.renderConfirmationAction = mock.fn();
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementation(() => sampleQuestionObj);
			mockJourney.response.answers = mockAnswer;
			mockJourney.getNextQuestionUrl = mock.fn(() => mockBackLink);
			mockJourney.getSection = mock.fn(() => mockSection);

			await question(req, res);

			assert.strictEqual(res.redirect.mock.callCount(), 0);
			assert.strictEqual(sampleQuestionObj.renderConfirmationAction.mock.callCount(), 1);
		});
	});

	describe('save', () => {
		it('should use saveData', async () => {
			const journeyId = 'has-questionnaire';

			req.params = {
				referenceId: mockRef,
				section: mockJourney.sections[0].segment,
				question: mockJourney.sections[0].questions[0].fieldName
			};

			res.locals.journeyResponse = {
				...journeyParams,
				answers: {}
			};

			req.body = {
				sampleFieldName: true,
				sampleFieldName_sub: 'send this',
				notSampleFieldName: 'do not send this'
			};

			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObj);

			const saveData = mock.fn();
			await buildSave(saveData)(req, res, journeyId);

			assert.strictEqual(sampleQuestionObj.getDataToSave.mock.callCount(), 1);
			assert.strictEqual(saveData.mock.callCount(), 1);
			assert.deepStrictEqual(saveData.mock.calls[0].arguments, [
				{
					req,
					res,
					journeyId: journeyParams.journeyId,
					referenceId: journeyParams.referenceId,
					isManageListItem: undefined,
					manageListItemRemove: false,
					manageListQuestionFieldName: undefined,
					data: undefined
				}
			]);
			// check other function calls
			const mocks = [sampleQuestionObj.checkForValidationErrors.mock, sampleQuestionObj.checkForSavingErrors.mock];
			for (const mockFn of mocks) {
				assert.strictEqual(mockFn.callCount(), 1);
				assert.deepStrictEqual(mockFn.calls[0].arguments[0], req);
				assert.deepStrictEqual(mockFn.calls[0].arguments[1], sections[0]);
				assert.deepStrictEqual(mockFn.calls[0].arguments[2], mockJourney);
			}
		});

		it('should handle error', async () => {
			const journeyId = 'has-questionnaire';
			const expectedViewModel = { a: 1 };
			const sampleQuestionObjWithActions = {
				...sampleQuestionObj,
				saveAction: mock.fn(),
				toViewModel: mock.fn(() => expectedViewModel),
				renderAction: mock.fn()
			};

			req.params = {
				referenceId: mockRef,
				section: mockJourney.sections[0].segment,
				question: mockJourney.sections[0].questions[0].fieldName
			};

			res.locals.journeyResponse = {
				...journeyParams,
				answers: {}
			};

			req.body = {
				sampleFieldName: true,
				sampleFieldName_sub: 'send this',
				notSampleFieldName: 'do not send this'
			};

			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObjWithActions);

			const saveData = mock.fn(() => {
				throw new Error('Expected error message');
			});
			await buildSave(saveData)(req, res, journeyId);

			assert.strictEqual(saveData.mock.callCount(), 1);
			assert.deepStrictEqual(
				saveData.mock.calls[0].arguments,
				[
					{
						req,
						res,
						journeyId: journeyParams.journeyId,
						referenceId: journeyParams.referenceId,
						data: undefined,
						isManageListItem: undefined,
						manageListItemRemove: false,
						manageListQuestionFieldName: undefined
					}
				],
				'save data args'
			);

			assert.deepStrictEqual(
				sampleQuestionObjWithActions.renderAction.mock.calls[0].arguments,
				[res, expectedViewModel],
				'render args'
			);
		});

		it('should handle validation errors', async () => {
			const expectedErrors = {
				errorViewModel: 'mocked-validation-error'
			};
			const journeyId = 'has-questionnaire';
			const sampleQuestionObjWithActions = {
				...sampleQuestionObj,
				renderAction: mock.fn(),
				checkForValidationErrors: mock.fn(() => expectedErrors)
			};

			req.params = {
				referenceId: mockRef,
				section: mockJourney.sections[0].segment,
				question: mockJourney.sections[0].questions[0].fieldName
			};

			res.locals.journeyResponse = {
				...journeyParams,
				answers: {}
			};

			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObjWithActions);

			const saveData = mock.fn();
			await buildSave(saveData)(req, res, journeyId);

			assert.strictEqual(saveData.mock.callCount(), 0);
			assert.deepStrictEqual(sampleQuestionObjWithActions.renderAction.mock.calls[0].arguments, [res, expectedErrors]);
		});

		it('should handle saving', async () => {
			res.redirect.mock.resetCalls();
			const journeyId = 'has-questionnaire';
			const expectedUrl = 'redirect-url';
			const sampleQuestionObjWithActions = {
				...sampleQuestionObj
			};
			sampleQuestionObjWithActions.getDataToSave.mock.mockImplementationOnce(() => ({
				answers: {
					[sampleQuestionObj.fieldName]: 'my-answer',
					aBooleanToTest: true
				}
			}));

			req.params = {
				referenceId: mockRef,
				section: mockJourney.sections[0].segment,
				question: mockJourney.sections[0].questions[0].fieldName
			};

			res.locals.journeyResponse = {
				...journeyParams,
				answers: {}
			};

			mockJourney.getSection = mock.fn(() => ({}));
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObjWithActions);
			mockJourney.getNextQuestionUrl = mock.fn(() => expectedUrl);

			const saveData = mock.fn();
			await buildSave(saveData)(req, res, journeyId);

			assert.strictEqual(saveData.mock.callCount(), 1);
			assert.strictEqual(res.redirect.mock.callCount(), 1);
			assert.strictEqual(res.redirect.mock.calls[0].arguments[0], expectedUrl);
			// journey response should be edited if redirecting to next question
			assert.strictEqual(res.locals.journeyResponse.answers?.sampleFieldName, 'my-answer');
			// booleans must be strings in journey response
			assert.strictEqual(res.locals.journeyResponse.answers?.aBooleanToTest, BOOLEAN_OPTIONS.YES);
		});

		it('should redirect to task list if configured', async () => {
			res.redirect.mock.resetCalls();
			const journeyId = 'has-questionnaire';
			const expectedUrl = 'redirect-url';
			const sampleQuestionObjWithActions = {
				...sampleQuestionObj
			};
			sampleQuestionObjWithActions.getDataToSave.mock.mockImplementationOnce(() => ({
				answers: { [sampleQuestionObj.fieldName]: 'my-answer' }
			}));

			req.params = {
				referenceId: mockRef,
				section: mockJourney.sections[0].segment,
				question: mockJourney.sections[0].questions[0].fieldName
			};

			res.locals.journeyResponse = {
				...journeyParams,
				answers: {}
			};

			mockJourney.getSection = mock.fn(() => ({}));
			mockJourney.getQuestionByParams = mock.fn();
			mockJourney.getQuestionByParams.mock.mockImplementationOnce(() => sampleQuestionObjWithActions);
			mockJourney.getNextQuestionUrl = mock.fn(() => expectedUrl);

			const saveData = mock.fn();
			await buildSave(saveData, true)(req, res, journeyId);

			assert.strictEqual(saveData.mock.callCount(), 1);
			assert.strictEqual(res.redirect.mock.callCount(), 1);
			assert.match(res.redirect.mock.calls[0].arguments[0], /\/task-list$/);
			assert.strictEqual(mockJourney.getNextQuestionUrl.mock.callCount(), 0);
			// journey response should not be edited if redirecting to task list
			assert.strictEqual(Object.keys(res.locals.journeyResponse.answers).length, 0);
		});

		describe('manageListQuestions', () => {
			const setupJourney = () => {
				const q = {
					fieldName: 'question-2',
					get isInManageListSection() {
						return true;
					},
					checkForValidationErrors: mock.fn(),
					getDataToSave: mock.fn(),
					checkForSavingErrors: mock.fn()
				};
				const manageListQ = {
					get isManageListQuestion() {
						return true;
					}
				};
				const req = {
					params: {
						section: 'section-1',
						question: 'question-1',
						manageListAction: 'add',
						manageListItemId: 'item-id-1',
						manageListQuestion: 'question-6'
					}
				};
				const journey = {
					getSection: mock.fn(() => ({ segment: 'section-1' })),
					getQuestionByParams: mock.fn(),
					redirectToNextQuestion: mock.fn(),
					response: { answers: {} }
				};
				const res = {
					locals: {
						journey,
						journeyResponse: { answers: {} }
					},
					redirect: mock.fn()
				};
				journey.getQuestionByParams.mock.mockImplementationOnce(() => q, 0);
				journey.getQuestionByParams.mock.mockImplementationOnce(() => manageListQ, 1);
				return { journey, manageListQ, req, res, q };
			};
			it('should find the parent manage list question', async () => {
				const { journey, manageListQ, req, res } = setupJourney();
				const saveData = mock.fn();
				await buildSave(saveData)(req, res, 'journey-1');
				assert.strictEqual(journey.getSection.mock.callCount(), 1);
				assert.strictEqual(journey.getQuestionByParams.mock.callCount(), 2);
				assert.strictEqual(journey.redirectToNextQuestion.mock.callCount(), 1);
				assert.strictEqual(journey.redirectToNextQuestion.mock.calls[0].arguments[2], manageListQ);
			});
			it('should preserve request route params', async () => {
				const { journey, req, res } = setupJourney();
				const saveData = mock.fn();
				await buildSave(saveData)(req, res, 'journey-1');
				assert.strictEqual(journey.redirectToNextQuestion.mock.callCount(), 1);
				const params = journey.redirectToNextQuestion.mock.calls[0].arguments[1];
				assert.deepStrictEqual(params, req.params);
			});
			it('should set manageListItemRemove is true when manageListAction is remove', async () => {
				const { journey, req, res } = setupJourney();
				req.params.manageListAction = MANAGE_LIST_ACTIONS.REMOVE;
				const saveData = mock.fn();
				await buildSave(saveData)(req, res, 'journey-1');
				assert.strictEqual(journey.redirectToNextQuestion.mock.callCount(), 1);
				assert.strictEqual(saveData.mock.calls[0].arguments[0].manageListItemRemove, true);
			});
		});
	});
});

const _getmockSummaryListData = (mockJourney) => {
	return {
		completedSectionCount: 1,
		sections: [
			{
				heading: 'Section 1',
				status: SECTION_STATUS.COMPLETE,
				list: {
					rows: [
						{
							actions: {
								items: [
									{
										href: `${mockBaseUrl}/${mockRef}/${mockJourney.sections[0].segment}/${mockJourney.sections[0].questions[0].fieldName}`,
										text: 'Answer',
										visuallyHiddenText: 'Answer'
									}
								]
							},
							key: { text: mockJourney.sections[0].questions[0].title },
							value: { html: 'Not started' }
						}
					]
				}
			},
			{
				heading: 'Section 2',
				status: SECTION_STATUS.IN_PROGRESS,
				list: {
					rows: [
						{
							actions: {
								items: [
									{
										href: `${mockBaseUrl}/${mockRef}/${mockJourney.sections[1].segment}/${mockJourney.sections[1].questions[0].fieldName}`,
										text: 'Answer',
										visuallyHiddenText: 'Answer'
									}
								]
							},
							key: { text: mockJourney.sections[1].questions[0].title },
							value: { html: 'Not started' }
						},
						{
							actions: {
								items: [
									{
										href: `${mockBaseUrl}/${mockRef}/${mockJourney.sections[1].segment}/${mockJourney.sections[1].questions[1].fieldName}`,
										text: 'Answer',
										visuallyHiddenText: 'Answer'
									}
								]
							},
							key: { text: mockJourney.sections[1].questions[1].title },
							value: { html: 'Not started' }
						}
					]
				}
			},
			{
				heading: 'Section 3',
				status: SECTION_STATUS.NOT_STARTED,
				list: {
					rows: [
						{
							actions: {
								items: [
									{
										href: `${mockBaseUrl}/${mockRef}/${mockJourney.sections[2].segment}/${mockJourney.sections[2].questions[1].fieldName}`,
										text: 'Answer',
										visuallyHiddenText: 'Answer'
									}
								]
							},
							key: { text: mockJourney.sections[2].questions[1].title },
							value: { html: 'Not started' }
						}
					]
				}
			}
		]
	};
};
