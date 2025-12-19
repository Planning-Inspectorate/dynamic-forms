import { COMPONENT_TYPES } from '../src/index.js';
import { createQuestions } from '../src/questions/create-questions.js';
import { questionClasses } from '../src/questions/questions.js';
import EmailValidator from '../src/validator/email-validator.js';

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
	},
	holidayDescription: {
		type: COMPONENT_TYPES.TEXT_ENTRY,
		title: 'Holiday Description',
		question: 'Describe your ideal holiday.',
		fieldName: 'holidayDescription',
		url: 'holiday-description',
		label: 'Description'
	},
	secretWish: {
		type: COMPONENT_TYPES.TEXT_ENTRY_REDACT,
		title: 'Secret Holiday Wish',
		question: 'Share a secret wish for your holiday (will be redacted).',
		fieldName: 'secretWish',
		url: 'secret-wish',
		label: 'Secret wish'
	},
	travelClass: {
		type: COMPONENT_TYPES.SELECT,
		title: 'Travel Class',
		question: 'Which class do you want to travel in?',
		fieldName: 'travelClass',
		url: 'travel-class',
		label: 'Select a class',
		options: [
			{ value: 'economy', text: 'Economy' },
			{ value: 'business', text: 'Business' },
			{ value: 'first', text: 'First Class' }
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
	holidaySnack: {
		type: COMPONENT_TYPES.SINGLE_LINE_INPUT,
		title: 'Favourite Holiday Snack',
		question: 'What is your favourite snack to eat on holiday?',
		fieldName: 'holidaySnack',
		url: 'holiday-snack',
		label: 'Snack'
	},
	companions: {
		type: COMPONENT_TYPES.MULTI_FIELD_INPUT,
		title: 'Travel Companions',
		question: 'Enter the names and ages of your travel companions.',
		fieldName: 'companions',
		url: 'companions',
		label: 'Companions',
		inputFields: [
			{ fieldName: 'name', label: 'Name', type: COMPONENT_TYPES.TEXT_ENTRY },
			{ fieldName: 'age', label: 'Age', type: COMPONENT_TYPES.NUMBER }
		]
	},
	nights: {
		type: COMPONENT_TYPES.NUMBER,
		title: 'Number of Nights',
		question: 'How many nights will you stay on holiday?',
		fieldName: 'nights',
		url: 'nights',
		label: 'Nights'
	},
	hotelAddress: {
		type: COMPONENT_TYPES.ADDRESS,
		title: 'Hotel Address',
		question: 'What is the address of your hotel?',
		fieldName: 'hotelAddress',
		url: 'hotel-address',
		label: 'Hotel address'
	},
	luggageWeight: {
		type: COMPONENT_TYPES.UNIT_OPTION,
		title: 'Luggage Weight',
		question: 'Select your luggage weight and unit.',
		fieldName: 'luggageWeightUnits',
		conditionalFieldName: 'luggageWeightValue',
		url: 'luggage-weight-units',
		label: 'Luggage weight',
		options: [
			{
				text: 'Kilograms',
				value: 'kg',
				conditional: { label: 'Weight in kilograms', fieldName: 'luggageWeightValue_kg', suffix: 'kg' }
			},
			{
				text: 'Pounds',
				value: 'lbs',
				conditional: { label: 'Weight in pounds', fieldName: 'luggageWeightValue_lbs', suffix: 'lbs' }
			}
		]
	},
	contactEmail: {
		type: COMPONENT_TYPES.EMAIL,
		title: 'Contact Email',
		question: 'What is your email address for booking confirmations?',
		fieldName: 'contactEmail',
		url: 'contact-email',
		label: 'Email address',
		validators: [new EmailValidator()]
	}
};

// questions in order for the journey - used to check the journey redirects to the next question correctly
export const questionsInOrder = [
	questionProps.manageListTest,
	questionProps.holidayActivities,
	questionProps.addInsurance,
	questionProps.travelInsuranceType,
	questionProps.holidayDestination,
	questionProps.departureDate,
	questionProps.holidayPeriod,
	questionProps.holidayDescription,
	questionProps.secretWish,
	questionProps.travelClass,
	questionProps.holidayArrival,
	questionProps.holidaySnack,
	questionProps.companions,
	questionProps.nights,
	questionProps.hotelAddress,
	questionProps.luggageWeight,
	questionProps.contactEmail
];

export const getQuestions = () => createQuestions(questionProps, questionClasses, {});
