import { Question } from '../../questions/question.ts';

import escape from 'escape-html';
import type { IAddress } from '../../lib/address.ts';
import { Address } from '../../lib/address.ts';
import { nl2br } from '../../lib/utils.ts';
import AddressValidator, { type AddressRequiredFields } from '../../validator/address-validator.ts';
import type { SiteAddressQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';
import type { Request } from 'express';

export class AddressQuestion extends Question {
	requiredFields?: AddressRequiredFields;
	addressLabels: {
		addressLine1: string;
		addressLine2: string;
		townCity: string;
		county: string;
		postcode: string;
	};

	constructor(params: SiteAddressQuestionParams) {
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
	 * Gets the body field names used by this question in form submissions.
	 */
	get bodyFieldNames() {
		return [
			`${this.fieldName}_addressLine1`,
			`${this.fieldName}_addressLine2`,
			`${this.fieldName}_townCity`,
			`${this.fieldName}_county`,
			`${this.fieldName}_postcode`
		];
	}

	answerForViewModel(answers: Record<string, unknown>) {
		let address = answers[this.fieldName] as IAddress | undefined;
		if (!address) {
			address = {
				addressLine1: answers[this.fieldName + '_addressLine1'] as string | undefined,
				addressLine2: answers[this.fieldName + '_addressLine2'] as string | undefined,
				townCity: answers[this.fieldName + '_townCity'] as string | undefined,
				county: answers[this.fieldName + '_county'] as string | undefined,
				postcode: answers[this.fieldName + '_postcode'] as string | undefined
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

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.labels = this.addressLabels;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
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
	 * @returns The formatted address to be presented in the UI
	 */
	format(answer: Record<string, unknown>) {
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
	 */
	formatAnswer(answer: Record<string, unknown> | null) {
		if (answer === null) return '';
		if (!answer) return this.notStartedText;
		return nl2br(escape(this.format(answer)));
	}

	formatLabelFromRequiredFields(fieldName: keyof AddressRequiredFields) {
		if (this.requiredFields && this.requiredFields[fieldName]) {
			return '';
		} else {
			return ' (optional)';
		}
	}
}

export default AddressQuestion;
