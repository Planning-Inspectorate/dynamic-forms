export const REDACT_CHARACTER: '\u2588';
export const TRUNCATED_MAX_LENGTH: 500;
/**
 * @class
 */
export default class TextEntryRedactQuestion extends Question {
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
	}: import('#question-types').QuestionParameters);
	textEntryCheckbox: any;
	label: any;
	onlyShowRedactedValueForSummary: any;
	useRedactedFieldNameForSave: any;
	showSuggestionsUi: any;
	summaryText: any;
	shouldTruncateSummary: any;
	prepQuestionForRendering(
		section: any,
		journey: any,
		customViewData: any,
		payload: any,
		options: any
	): import('#question').QuestionViewModel;
	answerForViewModel(answers: any): string;
	formatAnswerForSummary(
		sectionSegment: any,
		journey: any,
		answer: any,
		capitals?: boolean
	):
		| {
				key: string;
				value: string | Object;
				action: {
					href: string;
					text: string;
					visuallyHiddenText: string;
				};
		  }[]
		| {
				key: string;
				value: string;
				action: import('../../controller.js').ActionView | import('../../controller.js').ActionView[] | undefined;
		  }[];
}
import { Question } from '#question';
//# sourceMappingURL=question.d.ts.map
