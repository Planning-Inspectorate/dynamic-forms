export const REDACT_CHARACTER: '\u2588';
export const TRUNCATED_MAX_LENGTH: 500;
/**
 * @class
 */
export default class TextEntryRedactQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {import('../text-entry/question.js').TextEntryCheckbox} [params.textEntryCheckbox]
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {boolean} [params.onlyShowRedactedValueForSummary] whether to only show redacted value for summary
	 * @param {boolean} [params.useRedactedFieldNameForSave] whether to use the redacted field name when saving answers
	 * @param {boolean} [params.showSuggestionsUi] use the suggestions UI for this question
	 * @param {string} [params.summaryText] summaryText to use with the details component
	 * @param {boolean} [params.shouldTruncateSummary] determines whether redacted comment is truncated in summary view
	 */
	constructor({
		textEntryCheckbox,
		label,
		onlyShowRedactedValueForSummary,
		useRedactedFieldNameForSave,
		showSuggestionsUi,
		summaryText,
		shouldTruncateSummary,
		...params
	}: any);
	textEntryCheckbox: any;
	label: any;
	onlyShowRedactedValueForSummary: any;
	useRedactedFieldNameForSave: any;
	showSuggestionsUi: any;
	summaryText: any;
	shouldTruncateSummary: any;
	/**
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse
	 * @returns {Promise<{answers: Record<string, unknown>}>}
	 */
	getDataToSave(
		req: any,
		journeyResponse: any
	): Promise<{
		answers: Record<string, unknown>;
	}>;
	prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any, options: any): any;
	answerForViewModel(answers: any): string;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	formatAnswerForSummary(sectionSegment: any, journey: any, answer: any, capitals?: boolean): any;
}
