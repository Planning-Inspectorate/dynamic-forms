export const BOOLEAN_OPTIONS: Readonly<{
	YES: 'yes';
	NO: 'no';
}>;
export function yesNoToBoolean(value: string | any): boolean;
export function booleanToYesNoValue(value: any): 'yes' | 'no';
export function booleanToYesNoOrNull(value: boolean | null): string | null;
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
		interfaceType,
		options,
		editable
	}: {
		title: string;
		question: string;
		fieldName: string;
		url?: string | undefined;
		hint?: string | undefined;
		pageTitle?: string | undefined;
		description?: string | undefined;
		html?: string | undefined;
		interfaceType?: string | undefined;
		options?: import('../../questions/options-question.js').Option[] | undefined;
		validators?: any[] | undefined;
		editable?: boolean | undefined;
	});
	interfaceType: string;
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ getDataToSave(req: any, journeyResponse: JourneyResponse): Promise<Object>;
}
import RadioQuestion from '../radio/question.js';
//# sourceMappingURL=question.d.ts.map
