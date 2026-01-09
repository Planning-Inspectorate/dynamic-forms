import { COMPONENT_TYPES } from '#src/index.js';
import { createQuestions } from '#src/questions/create-questions.js';
import { questionClasses } from '#src/questions/questions.js';
import RequiredValidator from '#src/validator/required-validator.js';
import NumericValidator from '#src/validator/numeric-validator.js';
import AddressValidator from '#src/validator/address-validator.js';

/**
 * @typedef {import('../src/questions/question-props.js').QuestionProps} Props
 */

/** @type {Record<string, Props>} */
export const questionProps = {
	nights: {
		type: COMPONENT_TYPES.NUMBER,
		title: 'Number of Nights',
		question: 'How many nights will you stay on holiday?',
		fieldName: 'nights',
		url: 'nights',
		label: 'Nights',
		validators: [new NumericValidator({ min: 1 })]
	},
	manageListTest: {
		type: COMPONENT_TYPES.MANAGE_LIST,
		title: 'Holiday Activities',
		question: 'Holiday Activities',
		titleSingular: 'Holiday activity',
		fieldName: 'manageListTest',
		url: 'manage-list-test',
		showManageListQuestions: true,
		showAnswersInSummary: true
	},
	activityLocation: {
		type: COMPONENT_TYPES.ADDRESS,
		title: 'Activity Location',
		question: 'Where is the activity?',
		fieldName: 'activityLocation',
		url: 'activity-location',
		validators: [new AddressValidator({ requiredFields: { addressLine1: true } })]
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
		],
		validators: [new RequiredValidator()]
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
