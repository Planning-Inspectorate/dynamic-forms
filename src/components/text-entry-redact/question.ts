import { Question } from '../../questions/question.ts';
import { nl2br } from '../../lib/utils.ts';
import type { Request } from 'express';
import type { JourneyResponse } from '../../journey/journey-response.ts';
import type { Journey } from '../../journey/journey.ts';
import type { Section } from '../../section.ts';
import type { TextEntryRedactQuestionParams } from '../../types/question-props.ts';
import type { PrepQuestionForRenderingOptions, QuestionViewModel } from '../../types/question-types.ts';

export const REDACT_CHARACTER = '█';
export const TRUNCATED_MAX_LENGTH = 500;

export class TextEntryRedactQuestion extends Question {
	textEntryCheckbox?: TextEntryRedactQuestionParams['textEntryCheckbox'];
	label?: string;
	onlyShowRedactedValueForSummary?: boolean;
	useRedactedFieldNameForSave?: boolean;
	showSuggestionsUi?: boolean;
	summaryText?: string;
	shouldTruncateSummary?: boolean;

	constructor({
		textEntryCheckbox,
		label,
		onlyShowRedactedValueForSummary,
		useRedactedFieldNameForSave,
		showSuggestionsUi,
		summaryText,
		shouldTruncateSummary,
		...parentParams
	}: TextEntryRedactQuestionParams) {
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

	async getDataToSave(req: Request, journeyResponse: JourneyResponse) {
		if (this.useRedactedFieldNameForSave) {
			const fieldName = this.fieldName + 'Redacted';
			const answers: Record<string, unknown> = {};
			answers[fieldName] = req.body[this.fieldName];
			return { answers };
		}
		return super.getDataToSave(req, journeyResponse);
	}

	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options?: PrepQuestionForRenderingOptions
	) {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload, options);
		const answers = this.answerObjectFromJourneyResponse(journey.response, options);
		const answer = viewModel.question.value;
		viewModel.question.valueRedacted = answers[this.fieldName + 'Redacted'] || answer;
		viewModel.question.valueOriginal = answers[this.fieldName + 'Original'] || answer;
		return viewModel;
	}

	answerForViewModel(answers: Record<string, unknown>) {
		return nl2br(answers[this.fieldName] as string);
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		viewModel.question.textEntryCheckbox = this.textEntryCheckbox;
		viewModel.question.summaryText = this.summaryText;
		viewModel.showSuggestionsUi = this.showSuggestionsUi;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 */
	formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: string, capitals = true) {
		// get the response/answers for the section we're in - which might be a dynamic section
		const response = journey.responseForSection(sectionSegment);
		const redacted = response.answers[this.fieldName + 'Redacted'] as string | undefined;
		let toShow: string | undefined;
		if (this.onlyShowRedactedValueForSummary) {
			toShow = redacted;
		} else {
			toShow = redacted || answer;
		}

		if (this.shouldTruncateSummary && (toShow?.length ?? 0) > TRUNCATED_MAX_LENGTH) {
			const action = this.getAction(sectionSegment, journey, answer);
			const truncatedToShow = toShow!.substring(0, TRUNCATED_MAX_LENGTH);
			toShow = `${truncatedToShow}... <a class="govuk-link govuk-link--no-visited-state" href="${action && !Array.isArray(action) ? action.href : ''}">Read more</a>`;
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
