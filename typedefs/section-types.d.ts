import type { JourneyResponse } from '#src/journey/journey-response.js';
import type ManageListQuestion from '#src/components/manage-list/question.js';
import type { Question } from '#src/questions/question.js';
import type { RouteParams } from './journey-types.d.ts';

export interface GetNextQuestionParams {
	questionFieldName: string;
	response: JourneyResponse;
	// if this is part of a manage list section
	manageListQuestion?: ManageListQuestion;
	takeNextQuestion: boolean;
	routeParams: RouteParams;
	// to get previous question instead of next
	reverse: boolean;
}

export interface StaticGetNextQuestionParams extends GetNextQuestionParams {
	manageListQuestion: undefined;
	questions: Question[];
}
