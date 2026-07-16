import { Question } from '#question';
import { nl2br } from '../../lib/utils.js';

export const REDACT_CHARACTER = '█';
export const TRUNCATED_MAX_LENGTH = 500;

/**
 * @class
 */
export class TextEntryRedactQuestion extends Question {
	/**
	 * @param {import('../../questions/question-props.d.ts').TextEntryRedactQuestionParams} params
	 */
	constructor({
		textEntryCheckbox,
		label,
		onlyShowRedactedValueForSummary,
		useRedactedFieldNameForSave,
		showSuggestionsUi,
		summaryText,
		shouldTruncateSummary,
		...parentParams
	}) {
		super({
			...parentParams,
			viewFolder: 'text-entry-redact'
		});

		this.textEntryCheckbox = textEntryCheckbox;
		this.label = label;
		this.onlyShowRedactedValueForSummary = onlyShowRedactedValueForSummary;
		this.useRedactedFieldNameForSave = useRedactedFieldNameForSave;
		this.showSuggestionsUi = showSuggestionsUi;
		this.summaryText = summaryText;
		this.shouldTruncateSummary = shouldTruncateSummary;
	}

	/**
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse
	 * @returns {Promise<{answers: Record<string, unknown>}>}
	 */
	async getDataToSave(req, journeyResponse) {
		if (this.useRedactedFieldNameForSave) {
			const fieldName = this.fieldName + 'Redacted';
			const answers = {};
			answers[fieldName] = req.body[this.fieldName];
			return { answers };
		}
		return super.getDataToSave(req, journeyResponse);
	}

	prepQuestionForRendering(section, journey, customViewData, payload, options) {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload, options);
		const answers = this.answerObjectFromJourneyResponse(journey.response, options);
		const answer = viewModel.question.value;
		viewModel.question.valueRedacted = answers[this.fieldName + 'Redacted'] || answer;
		viewModel.question.valueOriginal = answers[this.fieldName + 'Original'] || answer;
		return viewModel;
	}

	answerForViewModel(answers) {
		return nl2br(answers[this.fieldName]);
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.textEntryCheckbox = this.textEntryCheckbox;
		viewModel.question.summaryText = this.summaryText;
		viewModel.showSuggestionsUi = this.showSuggestionsUi;
	}

	formatAnswerForSummary(sectionSegment, journey, answer, capitals = true) {
		const redacted = journey.response.answers[this.fieldName + 'Redacted'];
		let toShow;
		if (this.onlyShowRedactedValueForSummary) {
			toShow = redacted;
		} else {
			toShow = redacted || answer;
		}

		if (this.shouldTruncateSummary && toShow?.length > TRUNCATED_MAX_LENGTH) {
			const action = this.getAction(sectionSegment, journey, answer);
			const truncatedToShow = toShow.substring(0, TRUNCATED_MAX_LENGTH);
			toShow = `${truncatedToShow}... <a class="govuk-link govuk-link--no-visited-state" href="${action?.href}">Read more</a>`;
			return [
				{
					key: this.title ?? this.question,
					value: nl2br(toShow),
					action
				}
			];
		}

		return super.formatAnswerForSummary(sectionSegment, journey, toShow, capitals);
	}
}

export default TextEntryRedactQuestion;
