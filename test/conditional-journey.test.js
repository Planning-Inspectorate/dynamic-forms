import { describe, it } from 'node:test';
import assert from 'assert';
import { Section } from '#src/section.js';
import { Journey } from '#src/journey/journey.js';
import { COMPONENT_TYPES } from '#src/index.js';
import { createQuestions } from '#src/questions/create-questions.js';
import { questionClasses } from '#src/questions/questions.js';
import { whenQuestionHasAnswer } from '#src/components/utils/question-has-answer.js';
import { BOOLEAN_OPTIONS } from '#src/components/boolean/question.js';
import { createAppWithQuestions, renderQuestionCheck, postAnswer } from '#test/utils/question-test-utils.js';

const JOURNEY_ID = 'conditional-journey';

/**
 * Question props for conditional journey tests
 * @type {Record<string, import('#src/questions/question-props.js').QuestionProps>}
 */
const conditionalQuestionProps = {
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
	// Section 2: Trip (leads to section condition)
	tripType: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Trip Type',
		question: 'What type of trip are you planning?',
		fieldName: 'tripType',
		url: 'trip-type',
		label: 'Select a trip type',
		options: [
			{ value: 'domestic', text: 'Domestic' },
			{ value: 'international', text: 'International' }
		]
	},
	// Section 3: Visa (section-wide condition based on tripType)
	visaRequired: {
		type: COMPONENT_TYPES.BOOLEAN,
		title: 'Visa Required',
		question: 'Do you need a visa for your destination?',
		fieldName: 'visaRequired',
		url: 'visa-required',
		label: 'Visa required?'
	},
	visaType: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Visa Type',
		question: 'What type of visa do you need?',
		fieldName: 'visaType',
		url: 'visa-type',
		label: 'Select a visa type',
		options: [
			{ value: 'tourist', text: 'Tourist' },
			{ value: 'business', text: 'Business' }
		]
	},
	// Section 4: Accommodation (multi-question condition)
	accommodation: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Accommodation',
		question: 'Where will you stay?',
		fieldName: 'accommodation',
		url: 'accommodation',
		label: 'Select accommodation type',
		options: [
			{ value: 'hotel', text: 'Hotel' },
			{ value: 'hostel', text: 'Hostel' },
			{ value: 'apartment', text: 'Apartment' }
		]
	},
	hotelStars: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Hotel Stars',
		question: 'How many stars for your hotel?',
		fieldName: 'hotelStars',
		url: 'hotel-stars',
		label: 'Select star rating',
		options: [
			{ value: '3', text: '3 stars' },
			{ value: '4', text: '4 stars' },
			{ value: '5', text: '5 stars' }
		]
	},
	hotelBreakfast: {
		type: COMPONENT_TYPES.BOOLEAN,
		title: 'Hotel Breakfast',
		question: 'Do you want breakfast included?',
		fieldName: 'hotelBreakfast',
		url: 'hotel-breakfast',
		label: 'Include breakfast?'
	},
	// Section 5: Contact (always shown)
	contactEmail: {
		type: COMPONENT_TYPES.EMAIL,
		title: 'Contact Email',
		question: 'What is your email address?',
		fieldName: 'contactEmail',
		url: 'contact-email',
		label: 'Email address'
	}
};

/**
 * Create the questions for conditional tests
 */
const conditionalQuestions = createQuestions(conditionalQuestionProps, questionClasses, {});

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

			// Section 2: Trip type (determines section condition for visa)
			new Section('Trip Details', 'trip').addQuestion(questions.tripType),

			// Section 3: Visa with section-wide condition
			new Section('Visa', 'visa')
				.withSectionCondition(whenQuestionHasAnswer(questions.tripType, 'international'))
				.addQuestion(questions.visaRequired)
				.addQuestion(questions.visaType)
				.withCondition(whenQuestionHasAnswer(questions.visaRequired, BOOLEAN_OPTIONS.YES)),

			// Section 4: Accommodation with multi-question condition
			new Section('Accommodation', 'accommodation')
				.addQuestion(questions.accommodation)
				.startMultiQuestionCondition('hotel-group', whenQuestionHasAnswer(questions.accommodation, 'hotel'))
				.addQuestion(questions.hotelStars)
				.addQuestion(questions.hotelBreakfast)
				.endMultiQuestionCondition('hotel-group'),

			// Section 5: Contact (always shown)
			new Section('Contact', 'contact').addQuestion(questions.contactEmail)
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
 * @returns {Promise<import('#test/utils/test-server.js').TestServer>}
 */
function createAppWithJourney(ctx) {
	return createAppWithQuestions(ctx, {
		journeyId: JOURNEY_ID,
		questions: conditionalQuestions,
		createJourneyFn: createConditionalJourney
	});
}

const q = conditionalQuestionProps;

describe('conditional journey tests', () => {
	describe('simple condition (whenQuestionHasAnswer on single question)', () => {
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

			// Should skip insuranceLevel and premiumBenefits, go to next section (trip)
			assert.strictEqual(location, 'trip/trip-type');
		});
	});

	describe('chained conditions (multiple dependent conditions)', () => {
		it('should show both conditional questions when all conditions are met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'yes' to wantsInsurance
			await postAnswer(testServer, '/insurance/wants-insurance', {
				[q.wantsInsurance.fieldName]: BOOLEAN_OPTIONS.YES
			});

			// Answer 'premium' to insuranceLevel
			const location = await postAnswer(testServer, '/insurance/insurance-level', {
				[q.insuranceLevel.fieldName]: 'premium'
			});

			// Should go to premiumBenefits
			assert.strictEqual(location, 'insurance/premium-benefits');

			// Render the premium benefits question
			await renderQuestionCheck(ctx, testServer, '/insurance/premium-benefits', q.premiumBenefits.question);
		});

		it('should skip second conditional question when its condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'yes' to wantsInsurance
			await postAnswer(testServer, '/insurance/wants-insurance', {
				[q.wantsInsurance.fieldName]: BOOLEAN_OPTIONS.YES
			});

			// Answer 'basic' to insuranceLevel (not 'premium')
			const location = await postAnswer(testServer, '/insurance/insurance-level', {
				[q.insuranceLevel.fieldName]: 'basic'
			});

			// Should skip premiumBenefits and go to next section (trip)
			assert.strictEqual(location, 'trip/trip-type');
		});

		it('should skip all conditional questions when first condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'no' to wantsInsurance
			const location = await postAnswer(testServer, '/insurance/wants-insurance', {
				[q.wantsInsurance.fieldName]: BOOLEAN_OPTIONS.NO
			});

			// Should skip insuranceLevel and premiumBenefits, go to next section (trip)
			assert.strictEqual(location, 'trip/trip-type');
		});
	});

	describe('section-wide conditions (withSectionCondition)', () => {
		it('should show section questions when section condition is met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'international' to tripType
			const location = await postAnswer(testServer, '/trip/trip-type', {
				[q.tripType.fieldName]: 'international'
			});

			// Should go to visa section (visaRequired)
			assert.strictEqual(location, 'visa/visa-required');

			// Render the visa question
			await renderQuestionCheck(ctx, testServer, '/visa/visa-required', q.visaRequired.question);
		});

		it('should skip entire section when section condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'domestic' to tripType
			const location = await postAnswer(testServer, '/trip/trip-type', {
				[q.tripType.fieldName]: 'domestic'
			});

			// Should skip visa section and go to accommodation section
			assert.strictEqual(location, 'accommodation/accommodation');
		});

		it('should combine section condition with question condition', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'international' to tripType
			await postAnswer(testServer, '/trip/trip-type', {
				[q.tripType.fieldName]: 'international'
			});

			// Answer 'yes' to visaRequired
			const location = await postAnswer(testServer, '/visa/visa-required', {
				[q.visaRequired.fieldName]: BOOLEAN_OPTIONS.YES
			});

			// Should go to visaType (condition met)
			assert.strictEqual(location, 'visa/visa-type');

			// Render the visa type question
			await renderQuestionCheck(ctx, testServer, '/visa/visa-type', q.visaType.question);
		});

		it('should skip conditional question within section when its condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'international' to tripType
			await postAnswer(testServer, '/trip/trip-type', {
				[q.tripType.fieldName]: 'international'
			});

			// Answer 'no' to visaRequired
			const location = await postAnswer(testServer, '/visa/visa-required', {
				[q.visaRequired.fieldName]: BOOLEAN_OPTIONS.NO
			});

			// Should skip visaType and go to accommodation section
			assert.strictEqual(location, 'accommodation/accommodation');
		});
	});

	describe('multi-question conditions (startMultiQuestionCondition)', () => {
		it('should show all questions in group when condition is met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'hotel' to accommodation
			const location = await postAnswer(testServer, '/accommodation/accommodation', {
				[q.accommodation.fieldName]: 'hotel'
			});

			// Should go to hotelStars (first question in group)
			assert.strictEqual(location, 'accommodation/hotel-stars');

			// Render the hotel stars question
			await renderQuestionCheck(ctx, testServer, '/accommodation/hotel-stars', q.hotelStars.question);

			// Answer hotelStars
			const nextLocation = await postAnswer(testServer, '/accommodation/hotel-stars', {
				[q.hotelStars.fieldName]: '4'
			});

			// Should go to hotelBreakfast (second question in group)
			assert.strictEqual(nextLocation, 'accommodation/hotel-breakfast');

			// Render the hotel breakfast question
			await renderQuestionCheck(ctx, testServer, '/accommodation/hotel-breakfast', q.hotelBreakfast.question);
		});

		it('should skip all questions in group when condition is not met', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'hostel' to accommodation (not 'hotel')
			const location = await postAnswer(testServer, '/accommodation/accommodation', {
				[q.accommodation.fieldName]: 'hostel'
			});

			// Should skip hotelStars and hotelBreakfast, go to contact section
			assert.strictEqual(location, 'contact/contact-email');
		});

		it('should proceed to question after group ends', async (ctx) => {
			const testServer = await createAppWithJourney(ctx);

			// Answer 'hotel' to accommodation
			await postAnswer(testServer, '/accommodation/accommodation', {
				[q.accommodation.fieldName]: 'hotel'
			});

			// Answer hotelStars
			await postAnswer(testServer, '/accommodation/hotel-stars', {
				[q.hotelStars.fieldName]: '5'
			});

			// Answer hotelBreakfast (last in group)
			const location = await postAnswer(testServer, '/accommodation/hotel-breakfast', {
				[q.hotelBreakfast.fieldName]: BOOLEAN_OPTIONS.YES
			});

			// Should go to contact section (after group ends)
			assert.strictEqual(location, 'contact/contact-email');
		});
	});
});
