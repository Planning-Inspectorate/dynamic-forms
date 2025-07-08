import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import AddressQuestion from './question.js';
import { Address } from '../../lib/address.js';
import AddressValidator from '../../validator/address-validator.js';
import { configureNunjucksTestEnv } from '../../../test/utils/nunjucks.js';

describe('AddressQuestion', () => {
	const TITLE = 'What is the site address?';
	const QUESTION = 'Enter the site address details:';
	const FIELDNAME = 'address';
	const VIEWFOLDER = 'address-entry';
	const VALIDATORS = [];
	const REQUIREDFIELDS = {};

	const testAddress = {
		addressLine1: '123 Main St',
		addressLine2: 'Floor 2',
		townCity: 'Testville',
		postcode: 'TE1 2ST',
		county: 'Testshire'
	};

	const setup = () => {
		const question = new AddressQuestion({
			title: TITLE,
			question: QUESTION,
			fieldName: FIELDNAME,
			viewFolder: VIEWFOLDER,
			validators: VALIDATORS,
			requiredFields: REQUIREDFIELDS
		});

		const mockApi = {
			postSubmissionAddress: mock.fn(() => {}),
			updateAppellantSubmission: mock.fn()
		};

		const req = {
			body: {
				address_addressLine1: '123 Main St',
				address_addressLine2: 'Floor 2',
				address_townCity: 'Testville',
				address_postcode: 'TE1 2ST',
				address_county: 'Testshire',
				fieldName: FIELDNAME
			},
			appealsApiClient: mockApi
		};

		const journeyResponse = {
			journeyId: 'journey123',
			referenceId: '1234',
			answers: {}
		};
		return { question, mockApi, req, journeyResponse };
	};

	describe('getDataToSave', () => {
		it('should format the data correctly to be saved', async () => {
			const { question, req } = setup();
			const expectedAddress = new Address(testAddress);

			const journeyResponse = {
				answers: {}
			};

			const { answers } = await question.getDataToSave(req, journeyResponse);

			for (const [k] of Object.entries(testAddress)) {
				assert.strictEqual(answers[FIELDNAME][k], expectedAddress[k]);
			}
		});
	});

	describe('format', () => {
		it('should return formatted address from answer', () => {
			const { question } = setup();
			const formattedAddress = question.format(testAddress);
			assert.strictEqual(formattedAddress, '123 Main St\nFloor 2\nTestville\nTestshire\nTE1 2ST');
		});
	});

	describe('prepQuestionForRendering', () => {
		it('should format data for the view model', async () => {
			const { question } = setup();

			const journeyResponse = {
				answers: {
					[FIELDNAME]: testAddress
				}
			};

			const model = await question.prepQuestionForRendering(
				{},
				{
					getBackLink: mock.fn(),
					response: journeyResponse
				}
			);
			for (const k of Object.keys(testAddress)) {
				assert.strictEqual(model.question.value[k], testAddress[k]);
			}
		});
		it('should set optional labels when not required', async () => {
			const { question } = setup();
			const journeyResponse = {
				answers: {}
			};

			const model = await question.prepQuestionForRendering(
				{},
				{
					getBackLink: mock.fn(),
					response: journeyResponse
				}
			);

			assert.strictEqual(model.question.labels.addressLine1, 'Address line 1 (optional)');
			assert.strictEqual(model.question.labels.addressLine2, 'Address line 2 (optional)');
			assert.strictEqual(model.question.labels.townCity, 'Town or city (optional)');
			assert.strictEqual(model.question.labels.county, 'County (optional)');
			assert.strictEqual(model.question.labels.postcode, 'Postcode (optional)');
		});

		it('should include the hint under the h1 title', async () => {
			const { question } = setup();
			const hintText = 'We will not publish your address';
			question.hint = hintText;

			const response = { journeyId: 'testJourney', answers: { address: testAddress } };
			const model = await question.prepQuestionForRendering(
				{},
				{ getBackLink: mock.fn(), response },
				{ layoutTemplate: 'views/layout-question.njk' }
			);

			assert.strictEqual(model.question.hint, hintText);

			const nunjucks = configureNunjucksTestEnv();
			const mockRes = {
				render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
			};
			question.renderAction(mockRes, model);

			assert.strictEqual(mockRes.render.mock.callCount(), 1);
			const view = mockRes.render.mock.calls[0].result;
			assert.ok(view);
			assert.match(view, /Enter the site address details:/);
			assert.match(view, /<div class="govuk-hint">We will not publish your address<\/div>/);
		});
		it('should set required labels when required', async () => {
			VALIDATORS.push(
				new AddressValidator({
					requiredFields: {
						addressLine1: true,
						addressLine2: true,
						townCity: true,
						county: true,
						postcode: true
					}
				})
			);
			const { question } = setup();
			const journeyResponse = {
				answers: {}
			};

			const model = await question.prepQuestionForRendering(
				{},
				{
					getBackLink: mock.fn(),
					response: journeyResponse
				}
			);

			assert.strictEqual(model.question.labels.addressLine1, 'Address line 1');
			assert.strictEqual(model.question.labels.addressLine2, 'Address line 2');
			assert.strictEqual(model.question.labels.townCity, 'Town or city');
			assert.strictEqual(model.question.labels.county, 'County');
			assert.strictEqual(model.question.labels.postcode, 'Postcode');
		});
	});
});
