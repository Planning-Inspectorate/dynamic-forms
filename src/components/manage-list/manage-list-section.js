import { Section } from '#src/section.js';

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
	 *
	 * @returns {boolean}
	 */
	get isManageListSection() {
		return true;
	}

	/**
	 * Fluent API method for adding questions
	 * @param {import('#src/questions/question.js').Question} question
	 * @param {import('#src/components/manage-list/manage-list-section.js').ManageListSection} [manageListSection]
	 * @returns {Section}
	 */
	addQuestion(question, manageListSection) {
		if (!question) {
			throw new Error('question is required');
		}
		if (question.isManageListQuestion || Boolean(manageListSection)) {
			throw new Error('manage list sections do not support nested managed list questions');
		}
		// mark that this question is within a managed list section for routing and controller logic
		question.isInManagedListSection = true;
		return super.addQuestion(question);
	}
}
