import OptionsQuestion from '../../questions/options-question.js';
import questionUtils from '../utils/question-utils.js';

const defaultOptionJoinString = ',';

/**
 * @typedef ConditionalAnswerObject
 * @type {object}
 * @property {string} value the checkbox answer
 * @property {string} conditional the conditional text input
 */

export class CheckboxQuestion extends OptionsQuestion {
	/**
	 * @param {import('#typedefs/question-props.d.ts').CheckboxQuestionParams} params
	 */
	constructor({ title, question, fieldName, url, pageTitle, description, options, validators, viewData }) {
		super({
			title,
			question,
			viewFolder: 'checkbox',
			fieldName,
			url,
			pageTitle,
			description,
			options,
			validators,
			viewData
		});

		this.optionJoinString = defaultOptionJoinString;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		if (!answer) {
			return super.formatAnswerForSummary(sectionSegment, journey, answer, false);
		}

		// answer is single ConditionalAnswerObject
		if (answer?.conditional) {
			const selectedOption = this.options.find((option) => option.value === answer.value);

			const conditionalAnswerText = selectedOption.conditional?.label
				? `${selectedOption.conditional.label} ${answer.conditional}`
				: answer.conditional;

			const formattedConditionalText = [selectedOption.text, conditionalAnswerText].join('\n');

			return super.formatAnswerForSummary(sectionSegment, journey, formattedConditionalText, false);
		}

		// answer is a string
		const answerArray = answer.split(this.optionJoinString);

		const formattedAnswer = this.options
			.filter((option) => answerArray.includes(option.value))
			.map((option) => {
				if (option.conditional) {
					const conditionalAnswer =
						journey.response.answers[
							questionUtils.getConditionalFieldName(this.fieldName, option.conditional.fieldName)
						];
					return [option.text, conditionalAnswer].join('\n');
				}

				return option.text;
			})
			.join('\n');

		return super.formatAnswerForSummary(sectionSegment, journey, formattedAnswer, false);
	}
}

export default CheckboxQuestion;
