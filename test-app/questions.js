import { COMPONENT_TYPES } from '#src/index.js';
import { createQuestions } from '#src/questions/create-questions.js';
import { questionClasses } from '#src/questions/questions.js';

/**
 * @typedef {import('../src/questions/question-props.js').QuestionProps} Props
 */

/** @type {Record<string, Props>} */
export const questionProps = {
	manageListTest: {
		type: COMPONENT_TYPES.MANAGE_LIST,
		title: 'Holiday Activities',
		question: 'Which activities do you want to do on holiday?',
		fieldName: 'manageListTest',
		url: 'manage-list-test',
		label: 'Select all that apply'
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
	holidayDestination: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Holiday Destination',
		question: 'Where would you like to go on holiday?',
		fieldName: 'holidayDestination',
		url: 'holiday-destination',
		label: 'Choose a destination',
		options: [
			{ value: 'beach', text: 'Beach' },
			{ value: 'mountains', text: 'Mountains' },
			{ value: 'city', text: 'City' }
		]
	},
	departureDate: {
		type: COMPONENT_TYPES.DATE,
		title: 'Departure Date',
		question: 'When do you want to start your holiday?',
		fieldName: 'departureDate',
		url: 'departure-date',
		label: 'Select a date'
	},
	holidayPeriod: {
		type: COMPONENT_TYPES.DATE_PERIOD,
		title: 'Holiday Period',
		question: 'What is the period of your holiday?',
		fieldName: 'holidayPeriod',
		url: 'holiday-period',
		label: 'Select start and end dates'
	}
};

export const getQuestions = () => createQuestions(questionProps, questionClasses, {});
