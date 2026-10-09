import { Section } from '../../section.ts';
import type { Question } from '../../questions/question.ts';

/**
 * Extends the Section class for extra logic around managing lists.
 */
export class ManageListSection extends Section {
	constructor() {
		super('unused', 'unused');
	}

	/**
	 * Is this section a manage list section?
	 *
	 * Used by controller and other logic.
	 */
	get isManageListSection() {
		return true;
	}

	/**
	 * Override base implementation, to avoid adding nested manage lists
	 */
	addQuestion(question: Question, manageListSection?: ManageListSection) {
		if (!question) {
			throw new Error('question is required');
		}
		if (question.isManageListQuestion || Boolean(manageListSection)) {
			throw new Error('manage list sections do not support nested manage list questions');
		}
		// mark that this question is within a manage list section for routing and controller logic
		question.isInManageListSection = true;
		return super.addQuestion(question);
	}
}
