import { Question } from '#question';

import escape from 'escape-html';
import { Address } from '../../lib/address.js';
import { nl2br } from '../../lib/utils.js';
import AddressValidator from '../../validator/address-validator.js';

/**
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../section.js').Section} Section
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('appeals-service-api').Api.SubmissionAddress} SubmissionAddress

 */

export default class AddressQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 */
	constructor(params) {
		super({
			...params,
			viewFolder: 'address'
		});

		for (const validator of params.validators || []) {
			if (validator instanceof AddressValidator) {
				this.requiredFields = validator.requiredFields;
			}
		}

		this.addressLabels = {
			addressLine1: `Address line 1${this.formatLabelFromRequiredFields('addressLine1')}`,
			addressLine2: `Address line 2${this.formatLabelFromRequiredFields('addressLine2')}`,
			townCity: `Town or city${this.formatLabelFromRequiredFields('townCity')}`,
			county: `County${this.formatLabelFromRequiredFields('county')}`,
			postcode: `Postcode${this.formatLabelFromRequiredFields('postcode')}`
		};
	}

	/**
	 * @param {Record<string, any>} answers
	 * @returns {*|string}
	 */
	answerForViewModel(answers) {
		let address = answers[this.fieldName];
		if (!address) {
			address = {
				addressLine1: answers[this.fieldName + '_addressLine1'],
				addressLine2: answers[this.fieldName + '_addressLine2'],
				townCity: answers[this.fieldName + '_townCity'],
				county: answers[this.fieldName + '_county'],
				postcode: answers[this.fieldName + '_postcode']
			};
		}

		return {
			addressLine1: address?.addressLine1 || '',
			addressLine2: address?.addressLine2 || '',
			townCity: address?.townCity || '',
			county: address?.county || '',
			postcode: address?.postcode || ''
		};
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.labels = this.addressLabels;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse
	 * @returns {Promise<{answers: Record<string, unknown>}>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const data = {
			addressLine1: req.body[this.fieldName + '_addressLine1'],
			addressLine2: req.body[this.fieldName + '_addressLine2'],
			townCity: req.body[this.fieldName + '_townCity'],
			county: req.body[this.fieldName + '_county'],
			postcode: req.body[this.fieldName + '_postcode']
		};
		const allEmpty = Object.values(data).every((v) => !v);
		let address = null;
		if (!allEmpty) {
			address = new Address(data);
		}
		const answers = {
			[this.fieldName]: address
		};

		return {
			answers
		};
	}

	/**
	 * @param {Object<string, any>} answer
	 * @returns The formatted address to be presented in the UI
	 */
	format(answer) {
		const addressComponents = [
			answer.addressLine1,
			answer.addressLine2,
			answer.townCity,
			answer.county,
			answer.postcode
		];

		return addressComponents.filter(Boolean).join('\n');
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		let formattedAnswer = this.notStartedText;

		if (answer) {
			formattedAnswer = nl2br(escape(this.format(answer)));
		} else if (answer === null) {
			formattedAnswer = '';
		}

		return [
			{
				key: `${this.title}`,
				value: formattedAnswer,
				action: this.getAction(sectionSegment, journey, answer)
			}
		];
	}
	formatLabelFromRequiredFields(fieldName) {
		if (this.requiredFields && this.requiredFields[fieldName]) {
			return '';
		} else {
			return ' (optional)';
		}
	}
}
