import { describe, it } from 'node:test';
import { COMPONENT_TYPES } from '#src/components/utils/component-types.js';
import { createQuestions } from '#src/questions/create-questions.js';
import { questionClasses } from '#src/questions/questions.js';
import { Section, SECTION_STATUS } from '#section';
import assert from 'node:assert';
import { JourneyResponse } from '#journey-response';
import RequiredValidator from '#src/validator/required-validator.js';
import DateValidator from '#src/validator/date-validator.js';
import AddressValidator from '#src/validator/address-validator.js';

/**
 * @typedef {import('../src/questions/question-props.js').QuestionProps} Props
 */

/**
 * Check logic related to the question.isRequired method, which in turn drives the section status logic
 */
describe('is-required', () => {
	/** @type {() => Record<string, Props>} */
	const getQuestionProps = () => ({
		holidayActivities: {
			type: COMPONENT_TYPES.CHECKBOX,
			title: 'Holiday Activities',
			question: 'Which activities do you want to do on holiday?',
			fieldName: 'holidayActivities',
			url: 'holiday-activities',
			label: 'Select all that apply',
			options: [
				{ value: 'swimming', text: 'Swimming' },
				{ value: 'hiking', text: 'Hiking' },
				{ value: 'sightseeing', text: 'Sightseeing' }
			]
		},
		addInsurance: {
			type: COMPONENT_TYPES.BOOLEAN,
			title: 'Travel Insurance',
			question: 'Do you want to add travel insurance to your holiday?',
			fieldName: 'addInsurance',
			url: 'add-insurance',
			label: 'Add insurance?'
		},
		travelInsuranceType: {
			type: COMPONENT_TYPES.RADIO,
			title: 'Travel Insurance Type',
			question: 'Which type of travel insurance would you like?',
			fieldName: 'travelInsuranceType',
			url: 'travel-insurance-type',
			label: 'Select an insurance type',
			options: [
				{ value: 'basic', text: 'Basic' },
				{ value: 'comprehensive', text: 'Comprehensive' },
				{ value: 'premium', text: 'Premium' }
			]
		},
		holidayArrival: {
			type: COMPONENT_TYPES.DATE_TIME,
			title: 'Holiday Arrival',
			question: 'When would you like to arrive at your destination?',
			fieldName: 'holidayArrival',
			url: 'holiday-arrival',
			label: 'Enter your arrival time'
		},
		hotelAddress: {
			type: COMPONENT_TYPES.ADDRESS,
			title: 'Hotel Address',
			question: 'What is the address of your hotel?',
			fieldName: 'hotelAddress',
			url: 'hotel-address',
			label: 'Hotel address'
		}
	});

	const newSection = (questionProps) => {
		const questions = createQuestions(questionProps, questionClasses, {});

		return new Section('test', 'test')
			.addQuestion(questions.holidayActivities)
			.addQuestion(questions.addInsurance)
			.addQuestion(questions.travelInsuranceType)
			.addQuestion(questions.holidayArrival)
			.addQuestion(questions.hotelAddress);
	};
	const sectionStatus = (questionProps, answers = {}) => {
		const section = newSection(questionProps);

		const jr = new JourneyResponse('id-1', '', answers);
		return section.getStatus(jr);
	};

	it('should be section=complete if no questions are required', () => {
		const props = getQuestionProps();
		assert.strictEqual(sectionStatus(props), SECTION_STATUS.COMPLETE);
	});
	it('should be section=not started if any question is required', () => {
		const props = getQuestionProps();

		// for each question, mark each one required one at a time
		for (const key of Object.keys(props)) {
			const copy = getQuestionProps();
			copy[key].validators = [new RequiredValidator()];
			assert.strictEqual(sectionStatus(copy), SECTION_STATUS.NOT_STARTED);
		}
	});
	it('should treat date validator as required', () => {
		const props = getQuestionProps();
		props.holidayArrival.validators = [new DateValidator('My Date')];
		assert.strictEqual(sectionStatus(props, {}), SECTION_STATUS.NOT_STARTED);
	});
	it('should treat address validator as required if there are required fields', () => {
		const props = getQuestionProps();
		props.hotelAddress.validators = [
			new AddressValidator({
				requiredFields: {
					addressLine1: true,
					addressLine2: false,
					county: false,
					townCity: false,
					postcode: true
				}
			})
		];
		assert.strictEqual(sectionStatus(props, {}), SECTION_STATUS.NOT_STARTED);
	});
	it('should not treat address validator as required if there are no required fields', () => {
		const props = getQuestionProps();
		props.hotelAddress.validators = [new AddressValidator()];
		assert.strictEqual(sectionStatus(props, {}), SECTION_STATUS.COMPLETE);
	});
});
