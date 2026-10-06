import type ManageListQuestion from '#src/components/manage-list/question.js';
import type { Question } from '#src/questions/question.js';
import type { JourneyAnswers, JourneyResponseLike, RouteParams } from './journey-types.d.ts';

export interface GetNextQuestionParams<Answers extends object = JourneyAnswers> {
	questionFieldName: string;
	response: JourneyResponseLike<Answers>;
	// if this is part of a manage list section
	manageListQuestion?: ManageListQuestion;
	takeNextQuestion: boolean;
	routeParams: RouteParams;
	// to get previous question instead of next
	reverse: boolean;
}

export interface StaticGetNextQuestionParams<
	Answers extends object = JourneyAnswers
> extends GetNextQuestionParams<Answers> {
	manageListQuestion: undefined;
	questions: Question<Answers>[];
}
