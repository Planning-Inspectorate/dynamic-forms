/**
 * UnitOptions are the options displayed in the radio format - in this case the value
 * represents the unit.
 * Conditionals must be used to capture the relevant quantity.
 * Each conditional must have a fieldName which uses the conditionalFieldName from the
 * UnitOptionEntryQuestion object as a base, followed by an underscore and unit reference
 * eg 'siteAreaSquareMetres_hectares' - this is required for validation and saving to the DB
 * @typedef {{
 *   text: string;
 *   value: string;
 *     hint?: object;
 *   checked?: boolean | undefined;
 *   attributes?: Record<string, string>;
 *   behaviour?: 'exclusive';
 *   conditional: {
 *     fieldName: string;
 *         suffix: string;
 *     value?: unknown;
 *         label?: string;
 *         hint?: string;
 *     conversionFactor?: number;
 *   }
 *}} UnitOption
 */
export default class UnitOptionEntryQuestion extends Question {
	/** @type {Array<UnitOption>} */
	options: Array<UnitOption>;
	conditionalFieldName: any;
	label: any;
	optionJoinString: string;
	/**
	 * gets the view model for this question
	 * @param {import('../../section').Section} section - the current section
	 * @param {import('#journey').Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @param {import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions} options
	 * @returns {import('#question').QuestionViewModel & {
	 *   question: import('#question').QuestionViewModel['question'] & {
	 *     options:UnitOption[]
	 *   }
	 * }}
	 */
	prepQuestionForRendering(
		section: any,
		journey: import('#journey').Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options: import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions
	): import('#question').QuestionViewModel & {
		question: import('#question').QuestionViewModel['question'] & {
			options: UnitOption[];
		};
	};
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */ getDataToSave(
		req: any,
		journeyResponse: JourneyResponse
	): Promise<{
		answers: Record<string, unknown>;
	}>;
}
/**
 * UnitOptions are the options displayed in the radio format - in this case the value
 * represents the unit.
 * Conditionals must be used to capture the relevant quantity.
 * Each conditional must have a fieldName which uses the conditionalFieldName from the
 * UnitOptionEntryQuestion object as a base, followed by an underscore and unit reference
 * eg 'siteAreaSquareMetres_hectares' - this is required for validation and saving to the DB
 */
export type UnitOption = {
	text: string;
	value: string;
	hint?: object;
	checked?: boolean | undefined;
	attributes?: Record<string, string>;
	behaviour?: 'exclusive';
	conditional: {
		fieldName: string;
		suffix: string;
		value?: unknown;
		label?: string;
		hint?: string;
		conversionFactor?: number;
	};
};
import { Question } from '../../questions/question.js';
//# sourceMappingURL=question.d.ts.map
