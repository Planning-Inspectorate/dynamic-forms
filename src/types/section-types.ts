import type { JourneyResponse } from '../journey/journey-response.ts';
import type ManageListQuestion from '../components/manage-list/question.ts';
import type { Question } from '../questions/question.ts';
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

export interface StaticGetNextQuestionParams extends Omit<GetNextQuestionParams, 'manageListQuestion' | 'routeParams'> {
	questions: Question[];
}
