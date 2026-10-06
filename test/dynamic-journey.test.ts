import { describe, it } from 'node:test';
import assert from 'assert';
import { Section } from '#src/section.ts';
import { DynamicSection } from '#src/dynamic-section.ts';
import { Journey } from '#src/journey/journey.ts';
import { COMPONENT_TYPES } from '#src/index.ts';
import { createQuestions } from '#src/questions/create-questions.ts';
import { questionClasses } from '#src/questions/questions.ts';
import { whenQuestionHasAnswer } from '#src/components/utils/question-has-answer.ts';
import { BOOLEAN_OPTIONS } from '#src/components/boolean/question.ts';
import { createAppWithQuestions, renderQuestionCheck, postAnswer } from '#test/utils/question-test-utils.ts';

const JOURNEY_ID = 'dynamic-journey';

/**
 * Question props for conditional journey tests
 * @type {Record<string, import('#src/questions/question-props.ts').QuestionProps>}
 */
const questionProps = {
	// Section 1: Insurance (simple + chained conditions)
	wantsInsurance: {
		type: COMPONENT_TYPES.BOOLEAN,
		title: 'Want Insurance',
		question: 'Do you want to add travel insurance?',
		fieldName: 'wantsInsurance',
		url: 'wants-insurance',
		label: 'Add insurance?'
	},
	insuranceLevel: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Insurance Level',
		question: 'What level of insurance do you want?',
		fieldName: 'insuranceLevel',
		url: 'insurance-level',
		label: 'Select an insurance level',
		options: [
			{ value: 'basic', text: 'Basic' },
			{ value: 'premium', text: 'Premium' }
		]
	},
	premiumBenefits: {
		type: COMPONENT_TYPES.CHECKBOX,
		title: 'Premium Benefits',
		question: 'Which premium benefits do you want?',
		fieldName: 'premiumBenefits',
		url: 'premium-benefits',
		label: 'Select all that apply',
		options: [
			{ value: 'cancellation', text: 'Cancellation cover' },
			{ value: 'medical', text: 'Medical cover' },
			{ value: 'luggage', text: 'Luggage cover' }
		]
	},
	// Section 2: Contact (always shown)
	contactEmail: {
		type: COMPONENT_TYPES.EMAIL,
		title: 'Contact Email',
		question: 'What is your email address?',
		fieldName: 'contactEmail',
		url: 'contact-email',
		label: 'Email address'
	},
	// Section after the dynamic sections (regular section)
	paymentMethod: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Payment Method',
		question: 'How would you like to pay?',
		fieldName: 'paymentMethod',
		url: 'payment-method',
		label: 'Select a payment method',
		options: [
			{ value: 'card', text: 'Card' },
			{ value: 'bank-transfer', text: 'Bank transfer' }
		]
	}
};

// Dynamic sections: questions asked once per traveller (holiday-goer)
const travellerQuestionProps = {
	passportStatus: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Passport Status',
		question: 'Does this traveller have a valid passport?',
		fieldName: 'passportStatus',
		url: 'passport-status',
		label: 'Select passport status',
		options: [
			{ value: 'has-passport', text: 'Has a valid passport' },
			{ value: 'needs-passport', text: 'Needs to apply for a passport' }
		]
	},
	passportNumber: {
		type: COMPONENT_TYPES.SINGLE_LINE_INPUT,
		title: 'Passport Number',
		question: 'What is the passport number?',
		fieldName: 'passportNumber',
		url: 'passport-number',
		label: 'Passport number'
	},
	dietaryRequirements: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Dietary Requirements',
		question: 'Does this traveller have any dietary requirements?',
		fieldName: 'dietaryRequirements',
		url: 'dietary-requirements',
		label: 'Select dietary requirements',
		options: [
			{ value: 'none', text: 'No requirements' },
			{ value: 'vegetarian', text: 'Vegetarian' },
			{ value: 'other', text: 'Other' }
		]
	},
	dietaryDetails: {
		type: COMPONENT_TYPES.SINGLE_LINE_INPUT,
		title: 'Dietary Details',
		question: 'Please describe the dietary requirements',
		fieldName: 'dietaryDetails',
		url: 'dietary-details',
		label: 'Dietary details'
	}
};

/**
 * The travellers that each get their own DynamicSection.
 * In a real journey this list would typically come from a ManageList question
 * or a database; here it is fixed to keep the test deterministic.
 *
 * @type {Array<{ id: string, name: string }>}
 */
const travellers = [
	{ id: 'traveller-1', name: 'Din Djarin' },
	{ id: 'traveller-2', name: 'Grogu' }
];

/**
 * Create a single journey with various conditional logic scenarios:
 *
 * Section 1 - Insurance (simple + chained conditions):
 *   - wantsInsurance: always shown
 *   - insuranceLevel: shown if wantsInsurance = 'yes' (simple condition)
 *   - premiumBenefits: shown if insuranceLevel = 'premium' (chained condition)
 *
 * Section 2 - Trip:
 *   - tripType: always shown
 *
 * Section 3 - Visa (section-wide condition):
 *   - Entire section shown only if tripType = 'international'
 *   - visaRequired: shown if section condition met
 *   - visaType: shown if section condition met AND visaRequired = 'yes'
 *
 * Section 4 - Accommodation (multi-question condition):
 *   - accommodation: always shown
 *   - hotelStars + hotelBreakfast: shown only if accommodation = 'hotel' (multi-question group)
 *
 * Section 5 - Contact:
 *   - contactEmail: always shown
 *
 * Dynamic Sections - one per traveller (holiday-goer):
 *   - Each traveller gets a DynamicSection with its own answers stored in the
 *     `travellers` array (matched by the section segment / traveller id)
 *   - passportStatus: always shown
 *   - passportNumber: shown if passportStatus = 'has-passport' (question condition)
 *   - dietaryRequirements: always shown
 *   - dietaryDetails: shown if dietaryRequirements = 'other' (question condition)
 *   - conditions are evaluated per traveller, independently of other travellers
 *
 * Section 6 - Payment (regular section following the dynamic sections):
 *   - paymentMethod: always shown
 */
function createConditionalJourney(questions, response) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [
			// Section 1: Insurance with simple and chained conditions
			new Section('Insurance', 'insurance')
				.addQuestion(questions.wantsInsurance)
				.addQuestion(questions.insuranceLevel)
				.withCondition(whenQuestionHasAnswer(questions.wantsInsurance, BOOLEAN_OPTIONS.YES))
				.addQuestion(questions.premiumBenefits)
				.withCondition(whenQuestionHasAnswer(questions.insuranceLevel, 'premium')),

			// Section 2: Contact (always shown)
			new Section('Contact', 'contact').addQuestion(questions.contactEmail),

			// Dynamic sections: one per traveller, each with their own question conditions.
			// The DynamicSection segment is the traveller id, and 'travellers' is the
			// answers array key. Question conditions can only reference answers within
			// the same (per-traveller) section.
			...travellers.map((traveller) => {
				// create a fresh set of questions for each section
				const qs = createQuestions(travellerQuestionProps, questionClasses, {});

				return new DynamicSection(traveller.name, traveller.id, 'travellers')
					.addQuestion(qs.passportStatus)
					.addQuestion(qs.passportNumber)
					.withCondition(whenQuestionHasAnswer(qs.passportStatus, 'has-passport'))
					.addQuestion(qs.dietaryRequirements)
					.addQuestion(qs.dietaryDetails)
					.withCondition(whenQuestionHasAnswer(qs.dietaryRequirements, 'other'));
			}),

			// Section 5: Payment (regular section after the dynamic sections)
			new Section('Payment', 'payment').addQuestion(questions.paymentMethod)
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey.njk',
		taskListTemplate: 'views/layout-check-your-answers.njk',
		journeyTitle: 'Conditional Journey',
		returnToListing: false,
		makeBaseUrl: () => '/',
		initialBackLink: '/start',
		response
	});
}

/**
 * Helper to create an app with the conditional journey
 * @param {import('node:test').TestContext} ctx
 * @returns {Promise<import('#test/utils/test-server.ts').TestServer>}
 */
function createAppWithJourney(ctx) {
	return createAppWithQuestions(ctx, {
		journeyId: JOURNEY_ID,
		questions: createQuestions(questionProps, questionClasses, {}),
		createJourneyFn: createConditionalJourney
	});
}

describe('dynamic journey tests', () => {
	// test largely copied from conditional-journey test to ensure that logic isn't broken by DynamicSections in a Journey
	describe('simple condition (whenQuestionHasAnswer on single question)', () => {
		const q = questionProps;
		// noinspection DuplicatedCode
		it('should show conditional question when condition is met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// First, render the initial question
			await renderQuestionCheck(ctx, testServer, '/insurance/wants-insurance', q.wantsInsurance.question);

			// Answer 'yes' to wantsInsurance
			const location = await postAnswer(testServer, '/insurance/wants-insurance', {
				[q.wantsInsurance.fieldName]: BOOLEAN_OPTIONS.YES
			});

			// Should redirect to insuranceLevel (conditional question)
			assert.strictEqual(location, 'insurance/insurance-level');

			// Render the conditional question
			await renderQuestionCheck(ctx, testServer, '/insurance/insurance-level', q.insuranceLevel.question);
		});

		it('should skip conditional question when condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'no' to wantsInsurance
			const location = await postAnswer(testServer, '/insurance/wants-insurance', {
				[q.wantsInsurance.fieldName]: BOOLEAN_OPTIONS.NO
			});

			// Should skip insuranceLevel and premiumBenefits, go to next section (contact)
			assert.strictEqual(location, 'contact/contact-email');
		});
	});

	describe('dynamic sections (DynamicSection per traveller)', () => {
		const q = travellerQuestionProps;
		it('should navigate from a regular section into the first dynamic traveller section', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer the last regular question before the dynamic sections
			const location = await postAnswer(testServer, '/contact/contact-email', {
				[questionProps.contactEmail.fieldName]: 'traveller@example.com'
			});

			// Should move into the first traveller's dynamic section
			assert.strictEqual(location, 'traveller-1/passport-status');

			// Render the first question of the dynamic section
			await renderQuestionCheck(ctx, testServer, '/traveller-1/passport-status', q.passportStatus.question);
		});

		it('should show a conditional question within a traveller section when its condition is met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Traveller has a passport -> should ask for the passport number
			const location = await postAnswer(testServer, '/traveller-1/passport-status', {
				[q.passportStatus.fieldName]: 'has-passport'
			});

			assert.strictEqual(location, 'traveller-1/passport-number');

			// Render the conditional question within the dynamic section
			await renderQuestionCheck(ctx, testServer, '/traveller-1/passport-number', q.passportNumber.question);
		});

		it('should skip a conditional question within a traveller section when its condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Traveller needs to apply for a passport -> skip passport-number
			const location = await postAnswer(testServer, '/traveller-1/passport-status', {
				[q.passportStatus.fieldName]: 'needs-passport'
			});

			// Should skip passport-number and go to the next question in the section
			assert.strictEqual(location, 'traveller-1/dietary-requirements');
		});

		it('should support a second independent condition within the same traveller section', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Skip the passport branch
			await postAnswer(testServer, '/traveller-1/passport-status', {
				[q.passportStatus.fieldName]: 'needs-passport'
			});

			// Choose 'other' dietary requirements -> should ask for details
			const location = await postAnswer(testServer, '/traveller-1/dietary-requirements', {
				[q.dietaryRequirements.fieldName]: 'other'
			});

			assert.strictEqual(location, 'traveller-1/dietary-details');

			await renderQuestionCheck(ctx, testServer, '/traveller-1/dietary-details', q.dietaryDetails.question);
		});

		it('should keep answers and conditions isolated per traveller', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Traveller 1 has a passport -> conditional question is shown
			const traveller1Location = await postAnswer(testServer, '/traveller-1/passport-status', {
				[q.passportStatus.fieldName]: 'has-passport'
			});
			assert.strictEqual(traveller1Location, 'traveller-1/passport-number');

			// Traveller 2 needs a passport -> same conditional question is skipped
			const traveller2Location = await postAnswer(testServer, '/traveller-2/passport-status', {
				[q.passportStatus.fieldName]: 'needs-passport'
			});
			assert.strictEqual(traveller2Location, 'traveller-2/dietary-requirements');
		});

		it('should navigate from one traveller section to the next', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Complete traveller 1's section
			await postAnswer(testServer, '/traveller-1/passport-status', {
				[q.passportStatus.fieldName]: 'needs-passport'
			});
			const location = await postAnswer(testServer, '/traveller-1/dietary-requirements', {
				[q.dietaryRequirements.fieldName]: 'none'
			});

			// Should move into the second traveller's dynamic section
			assert.strictEqual(location, 'traveller-2/passport-status');
		});

		it('should navigate from the last traveller section into the following regular section', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Complete the last traveller's section
			await postAnswer(testServer, '/traveller-2/passport-status', {
				[q.passportStatus.fieldName]: 'needs-passport'
			});
			const location = await postAnswer(testServer, '/traveller-2/dietary-requirements', {
				[q.dietaryRequirements.fieldName]: 'none'
			});

			// Should move into the regular Payment section after the dynamic sections
			assert.strictEqual(location, 'payment/payment-method');
		});
	});
});
