import RadioQuestion from '../radio/question.js';

export const BOOLEAN_OPTIONS = Object.freeze({
	YES: 'yes',
	NO: 'no'
});

/**
 * @param {string|*} value
 * @returns {boolean}
 */
export const yesNoToBoolean = (value) => {
	if (typeof value === 'boolean') {
		return value;
	}
	return value === BOOLEAN_OPTIONS.YES;
};

export const booleanToYesNoValue = (value) => {
	return value ? BOOLEAN_OPTIONS.YES : BOOLEAN_OPTIONS.NO;
};

/**
 * @param {boolean|null} value
 * @returns {string|null}
 */
export const booleanToYesNoOrNull = (value) => {
	if (typeof value === 'boolean') {
		return booleanToYesNoValue(value);
	}
	return null;
};

export default class BooleanQuestion extends RadioQuestion {
	/**
	 * @param {Object} params
	 * @param {string} params.title
	 * @param {string} params.question
	 * @param {string} params.fieldName
	 * @param {string} [params.url]
	 * @param {string} [params.hint]
	 * @param {string} [params.pageTitle]
	 * @param {string} [params.description]
	 * @param {string} [params.html]
	 * @param {string} [params.interfaceType]
	 * @param {Array.<import('../../questions/options-question.js').Option>} [params.options]
	 * @param {Array.<import('#base-validator').BaseValidator>} [params.validators]
	 * @param {boolean} [params.editable]
	 */
	constructor({
		title,
		question,
		fieldName,
		url,
		hint,
		pageTitle,
		description,
		html,
		validators,
		interfaceType = 'radio',
		options,
		editable
	}) {
		let defaultOptions = options || [
			{
				text: 'Yes',
				value: BOOLEAN_OPTIONS.YES,
				attributes: { 'data-cy': 'answer-yes' }
			},
			{
				text: 'No',
				value: BOOLEAN_OPTIONS.NO,
				attributes: { 'data-cy': 'answer-no' }
			}
		];

		if (interfaceType === 'checkbox') {
			defaultOptions = options || [{ text: 'Confirm', value: BOOLEAN_OPTIONS.YES }];
		}

		super({
			title,
			question,
			viewFolder: 'boolean',
			fieldName,
			url,
			hint,
			pageTitle,
			description,
			options: defaultOptions,
			validators,
			html,
			editable
		});

		this.interfaceType = interfaceType;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};
		const fieldValue = req.body[this.fieldName]?.trim();

		answers[this.fieldName] = fieldValue === BOOLEAN_OPTIONS.YES;

		for (const propName in req.body) {
			if (propName.startsWith(this.fieldName + '_')) {
				answers[propName] = req.body[propName]?.trim();
			}
		}

		return { answers };
	}
}
