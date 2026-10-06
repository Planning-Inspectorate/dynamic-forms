import { SECTION_STATUS } from './section.ts';
import questionUtils from './components/utils/question-utils.ts';
import { answerObjectForListItemSaving } from '#src/lib/answer-utils.ts';
import { booleanToYesNoValue } from '#src/components/boolean/question.ts';
import { MANAGE_LIST_ACTIONS } from '#src/components/manage-list/manage-list-actions.ts';
import { toArray } from '#src/lib/utils.ts';
import type { ActionView } from '#typedefs/question-types.ts';
import type { Request, Response, Handler } from 'express';
import type { Journey } from '#src/journey/journey.ts';
import type { JourneyResponse } from '#journey-response';
import type { ManageListAnswers, RouteParams } from '#typedefs/journey-types.ts';
import type ManageListQuestion from '#src/components/manage-list/question.ts';
import type { DynamicSection } from '#src/dynamic-section.ts';

export interface SectionView {
	heading: string;
	status: string;
	list: {
		rows: RowView[];
	};
}

export interface RowView {
	key: { text: string };
	value: { text: string } | { html: string };
	actions?: { items: ActionView[] };
}

/**
 * build a view model for a section in the journey overview
 */
function buildSectionViewModel(name: string, status: string = ''): SectionView {
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
 */
function buildSectionRowViewModel(key: string, value: string, action?: ActionView | ActionView[]): RowView {
	return {
		key: {
			text: key
		},
		value: {
			html: value
		},
		actions: action ? { items: toArray(action) } : undefined
	};
}

export function buildList(viewData: Record<string, unknown> = {}): Handler {
	return (req, res) => list(req, res, viewData.pageCaption as string, viewData);
}

/**
 * Controller to render the task-list/check-your-answers page
 */
export async function list(req: Request, res: Response, pageCaption: string, viewData: Record<string, unknown>) {
	//render check your answers view
	const journey = res.locals.journey as Journey;
	const journeyResponse = res.locals.journeyResponse as JourneyResponse;

	const summaryListData = {
		sections: [] as SectionView[],
		completedSectionCount: 0
	};

	for (const section of journey.sections) {
		const status = section.getStatus(journeyResponse);
		const sectionView = buildSectionViewModel(section.name, status);

		// answers for this section may be within an array, for example dynamic sections
		const response = section.getResponse(journeyResponse);

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

			if (!question.shouldDisplay(response)) {
				continue;
			}

			// answers here may be from an array for dynamic sections
			// this is handled by section.responseForSection above
			const answers = response.answers;
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
				const viewModelRow = buildSectionRowViewModel(row.key, row.value, row.action);
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
 * Render an individual question
 */
export async function question(req: Request, res: Response) {
	const { journey } = res.locals;

	const section = journey.getSection(req.params.section);
	const question = journey.getQuestionByParams(req.params);

	if (!question || !section) {
		return res.redirect(journey.taskListUrl);
	}

	let manageListQuestion;
	if (question.isInManageListSection) {
		// find parent question for the manage list
		manageListQuestion = journey.getQuestionByParams({ section: req.params.section, question: req.params.question });
		if (!manageListQuestion) {
			return res.redirect(journey.taskListUrl);
		}
	}

	const viewModel = question.toViewModel({
		params: req.params,
		manageListQuestion,
		section,
		journey,
		customViewData: {
			originalUrl: req.originalUrl
		}
	});
	if (
		question.isManageListQuestion &&
		typeof question.renderConfirmationAction === 'function' &&
		req.params.manageListAction === MANAGE_LIST_ACTIONS.REMOVE
	) {
		const answers = journey.response.answers;
		if (answers && Object.hasOwn(answers, question.fieldName) && Array.isArray(answers[question.fieldName])) {
			const item = (answers[question.fieldName] as ManageListAnswers[]).find(
				(i) => i.id === req.params.manageListItemId
			);
			if (item) return question.renderConfirmationAction(res, item, viewModel);
		}
		// if we can't find the item to remove, redirect to task list rather than erroring out as the session may have expired or been tampered with
		return res.redirect(journey.taskListUrl);
	}
	return question.renderAction(res, viewModel);
}

export interface SaveParams {
	req: Request;
	res: Response;
	journeyId: string;
	referenceId: string;
	isManageListItem: boolean;
	manageListQuestionFieldName?: string;
	manageListItemRemove?: boolean;
	data: Record<string, unknown>;

	/** is this save action for a question within a DynamicSection? */
	isDynamicSection: boolean;
	/** if this is within a DynamicSection, what is the section ID (segment) */
	dynamicSectionId?: string;
	/** if this is within a DynamicSection, what is the fieldName for the array? */
	dynamicSectionFieldName?: string;
}

export type SaveDataFn = (params: SaveParams) => Promise<void>;

/**
 * @param saveData
 * @param [redirectToTaskListOnSuccess] - optionally redirect to the task list after save instead of next question
 */
export function buildSave(saveData: SaveDataFn, redirectToTaskListOnSuccess?: boolean): Handler {
	return async (req, res) => {
		const journey = res.locals.journey as Journey;
		const journeyResponse = res.locals.journeyResponse as JourneyResponse;

		const routeParams = req.params as RouteParams;

		const section = journey.getSection(routeParams.section);
		const question = journey.getQuestionByParams(routeParams);

		if (!question || !section) {
			return res.redirect(journey.taskListUrl);
		}

		let manageListQuestion: ManageListQuestion | undefined;
		if (question.isInManageListSection || routeParams.manageListAction === MANAGE_LIST_ACTIONS.REMOVE) {
			// find parent question for the manage list
			manageListQuestion = journey.getQuestionByParams({
				section: routeParams.section,
				question: routeParams.question
			}) as ManageListQuestion;
			if (!manageListQuestion) {
				return res.redirect(journey.taskListUrl);
			}
		}
		const isDynamicSection = section.isDynamicSection;

		try {
			// check for validation errors
			const errorViewModel = question.checkForValidationErrors(req, section, journey, manageListQuestion);
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
				isManageListItem: question.isInManageListSection,
				manageListQuestionFieldName: manageListQuestion?.fieldName,
				manageListItemRemove: req.params?.manageListAction === MANAGE_LIST_ACTIONS.REMOVE,
				isDynamicSection,
				dynamicSectionId: isDynamicSection ? section.segment : undefined,
				dynamicSectionFieldName: isDynamicSection ? (section as DynamicSection).fieldName : undefined,
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
			// edit the journey.response which question.shouldDisplay uses
			// we need to ensure the latest answer just submitted is included
			// as question.shouldDisplay checks the response and is used to determine the next question
			let answers = journeyResponse.answers;
			if (question.isInManageListSection) {
				answers = answerObjectForListItemSaving(journeyResponse, manageListQuestion!, routeParams.manageListItemId);
			} else if (isDynamicSection) {
				answers = answerObjectForListItemSaving(journeyResponse, section as DynamicSection, section.segment);
			}
			for (const [k, v] of Object.entries(data?.answers || {})) {
				if (typeof v === 'boolean') {
					// boolean answers are saved at booleans, but stored in session and
					// checked by display logic as yes/no
					answers[k] = booleanToYesNoValue(v);
					continue;
				}
				answers[k] = v;
			}
			// move to the next question
			return journey.redirectToNextQuestion(res, routeParams, manageListQuestion);
		} catch (err) {
			const viewModel = question.toViewModel({
				params: routeParams,
				manageListQuestion,
				section,
				journey,
				customViewData: {
					originalUrl: req.originalUrl,
					errorSummary: (err as { errorSummary?: unknown }).errorSummary ?? [
						{ text: (err as Error).toString(), href: '#' }
					]
				}
			});
			return question.renderAction(res, viewModel);
		}
	};
}
