import { JourneyResponse } from '#src/journey/journey-response.js';
import ManageListQuestion from '#src/components/manage-list/question.js';
import { Question } from '#src/questions/question.js';
import { RouteParams } from '#src/journey/journey-types.d.ts';

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
