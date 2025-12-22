import { SECTION_STATUS } from './section.js';
import questionUtils from './components/utils/question-utils.js';

/**
 * @typedef {import('./journey/journey.js').Journey} Journey
 * @typedef {import('./questions/question.js').Question} Question
 * @typedef {import('./section').Section} Section
 */

/**
 * @typedef {Object} SectionView
 * @property {string} heading
 * @property {string} status
 * @property {Object} list
 * @property {Array.<RowView>} list.rows
 */

/**
 * @typedef {Object} RowView
 * @property {{ text: string }} key
 * @property {{ text: string } | { html: string }} value
 * @property {{ items: ActionView[] }} [actions]
 */

/**
 * @typedef {Object} ActionView
 * @property {string} href
 * @property {string} text
 * @property {string} [visuallyHiddenText]
 */

/**
 * build a view model for a section in the journey overview
 * @param {string} name
 * @param {string} [status]
 * @returns {SectionView} a representation of a section
 */
function buildSectionViewModel(name, status = '') {
	return {
		heading: name,
		status: status,
		list: {
			rows: []
		}
	};
}

/**
 * build a view model for a row in the journey overview
 * @param {string} key
 * @param {string} value
 * @param {ActionView|ActionView[]} action
 * @returns {RowView} a representation of a row
 */
function buildSectionRowViewModel(key, value, action) {
	return {
		key: {
			text: key
		},
		value: {
			html: value
		},
		actions: {
			items: Array.isArray(action) ? action : [action]
		}
	};
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} pageCaption
 * @param {object} viewData
 */
export async function list(req, res, pageCaption, viewData) {
	//render check your answers view
	/** @type {Journey} */
	const journey = res.locals.journey;
	/** @type {import("./journey/journey-response.js").JourneyResponse} */
	const journeyResponse = res.locals.journeyResponse;

	const summaryListData = {
		/** @type {SectionView[]} */
		sections: [],
		completedSectionCount: 0
	};

	for (const section of journey.sections) {
		const status = section.getStatus(journeyResponse);
		const sectionView = buildSectionViewModel(section.name, status);

		// update completed count
		if (status === SECTION_STATUS.COMPLETE) {
			summaryListData.completedSectionCount++;
		}

		// add questions
		for (const question of section.questions) {
			// don't show question on tasklist if set to false
			if (question.taskList === false) {
				continue;
			}

			if (!question.shouldDisplay(journeyResponse)) {
				continue;
			}

			const answers = journey.response?.answers;
			let answer = answers[question.fieldName];
			const conditionalAnswer = questionUtils.getConditionalAnswer(answers, question, answer);
			if (conditionalAnswer) {
				answer = {
					value: answer,
					conditional: conditionalAnswer
				};
			}
			const rows = question.formatAnswerForSummary(section.segment, journey, answer);
			rows.forEach((row) => {
				let viewModelRow = buildSectionRowViewModel(row.key, row.value, row.action);
				sectionView.list.rows.push(viewModelRow);
			});
		}

		summaryListData.sections.push(sectionView);
	}

	return res.render('components/task-list/index', {
		...viewData,
		pageCaption,
		summaryListData,
		journeyComplete: journey.isComplete(),
		layoutTemplate: journey.taskListTemplate,
		journeyTitle: journey.journeyTitle
	});
}

/**
 * @type {import('express').Handler}
 */
export async function question(req, res) {
	//render an individual question
	const { journey } = res.locals;

	const section = journey.getSection(req.params.section);
	const question = journey.getQuestionByParams(req.params);

	if (!question || !section) {
		return res.redirect(journey.taskListUrl);
	}

	const viewModel = question.prepQuestionForRendering(section, journey);
	return question.renderAction(res, viewModel);
}

/**
 * @typedef {Object} SaveParams
 * @property {import('express').Request} req
 * @property {import('express').Response} res
 * @property {string} journeyId
 * @property {string} referenceId
 * @property {Object<string, any>} data
 */

/**
 * @typedef {(params: SaveParams) => Promise<void>} SaveDataFn
 */

/**
 * @param {SaveDataFn} saveData
 * @param {boolean} [redirectToTaskListOnSuccess] - optionally redirect to the task list after save instead of next question
 * @returns {import('express').Handler}
 */
export function buildSave(saveData, redirectToTaskListOnSuccess) {
	return async (req, res) => {
		/** @type {import('./journey/journey.js').Journey} */
		const journey = res.locals.journey;
		/** @type {import('./journey/journey-response.js').JourneyResponse} */
		const journeyResponse = res.locals.journeyResponse;

		const section = journey.getSection(req.params.section);
		const question = journey.getQuestionByParams(req.params);

		if (!question || !section) {
			return res.redirect(journey.taskListUrl);
		}

		try {
			// check for validation errors
			const errorViewModel = question.checkForValidationErrors(req, section, journey);
			if (errorViewModel) {
				return question.renderAction(res, errorViewModel);
			}

			// save
			const data = await question.getDataToSave(req, journeyResponse);

			await saveData({
				req,
				res,
				journeyId: journeyResponse.journeyId,
				referenceId: journeyResponse.referenceId,
				data
			});

			// check for saving errors
			const saveViewModel = question.checkForSavingErrors(req, section, journey);
			if (saveViewModel) {
				return question.renderAction(res, saveViewModel);
			}
			if (redirectToTaskListOnSuccess) {
				return res.redirect(journey.taskListUrl);
			}
			// move to the next question
			return journey.redirectToNextQuestion(res, section.segment, question.fieldName);
		} catch (err) {
			const viewModel = question.prepQuestionForRendering(section, journey, {
				errorSummary: err.errorSummary ?? [{ text: err.toString(), href: '#' }]
			});
			return question.renderAction(res, viewModel);
		}
	};
}
