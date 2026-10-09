import RadioQuestion from '../radio/question.ts';
import type { BooleanQuestionParams } from '../../types/question-props.ts';
import type { Request } from 'express';

export type YesNo = 'yes' | 'no';

export const BOOLEAN_OPTIONS = Object.freeze({
	YES: 'yes',
	NO: 'no'
});

export const yesNoToBoolean = (value: string | boolean) => {
	if (typeof value === 'boolean') {
		return value;
	}
	return value === BOOLEAN_OPTIONS.YES;
};

export const booleanToYesNoValue = (value: boolean): YesNo => {
	return value ? BOOLEAN_OPTIONS.YES : BOOLEAN_OPTIONS.NO;
};

export const booleanToYesNoOrNull = (value: boolean | null) => {
	if (typeof value === 'boolean') {
		return booleanToYesNoValue(value);
	}
	return null;
};

export class BooleanQuestion extends RadioQuestion {
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
		editable,
		viewData
	}: BooleanQuestionParams) {
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
			editable,
			viewData
		});

		this.interfaceType = interfaceType;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};
		const fieldValue = req.body[this.fieldName]?.trim();

		answers[this.fieldName] = fieldValue === BOOLEAN_OPTIONS.YES;

		for (const propName in req.body) {
			if (propName.startsWith(this.fieldName + '_')) {
				answers[propName] = req.body[propName]?.trim();
			}
		}

		return { answers };
	}

	/**
	 * Normalises a stored boolean answer back to 'yes'/'no' before computing the
	 * view model value, so the radio's `checked` state resolves correctly.
	 *
	 * getDataToSave() saves a real boolean. Top-level questions get this converted
	 * back to 'yes'/'no' by buildGetJourneyResponseFromSession, but that conversion
	 * is shallow and doesn't reach into manage-list item arrays, so nested
	 * BooleanQuestions (e.g. a manage-list sub-question) would otherwise receive
	 * the raw boolean.
	 */
	answerForViewModel(answers: Record<string, unknown>, isPayload: boolean): YesNo | unknown {
		const rawValue = answers[this.fieldName];
		if (typeof rawValue === 'boolean') {
			return booleanToYesNoValue(rawValue);
		}
		return super.answerForViewModel(answers, isPayload);
	}

	/**
	 * Normalises a stored boolean answer back to 'yes'/'no' before formatting,
	 * so summary/check-your-answers pages display 'Yes'/'No' instead of the
	 * literal 'true'/'false' - see answerForViewModel for why this is needed.
	 */
	formatAnswer(answer: unknown) {
		if (typeof answer === 'boolean') {
			return super.formatAnswer(booleanToYesNoValue(answer));
		}
		return super.formatAnswer(answer);
	}
}

export default BooleanQuestion;
