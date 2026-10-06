import { Section } from '#section';

/**
 * Use a dynamic section for sections which are generated from an array of objects
 *
 * This can be useful for adding a section for each entry in a ManageList, or each row in a database
 * The controller logic, when encountering a DynamicSection, will check for an answer object within
 * `journeyResponse.answers[fieldName]`, matching by the `id` property
 *
 * ```
 * answers = {
 *   myField: 'some answer',
 *   list: [
 *     { id: 'person-id-1', name: 'Grogu' },
 *     { id: 'person-id-2', name: 'Mando' }
 *   ]
 * }
 * ```
 *
 * In this example, create a DynamicSection for each list entry:
 *
 * ```
 *  function createPersonSection(person) {
 *  return new DynamicSection(person.name, person.id, 'list')
 *   .addQuestion(questions.name)
 *   // ... add questions
 * }
 * ```
 *
 * When using with buildSave, be sure to handle the parameters: `isDynamicSection`, `dynamicSectionId`,`dynamicSectionFieldName`
 */
export class DynamicSection extends Section {
	/**
	 * @param name
	 * @param segment
	 * @param fieldName the key used in the answers object, which will be an array of answers for this section
	 */
	constructor(name, segment, fieldName) {
		super(name, segment);

		this.fieldName = fieldName;
	}

	/**
	 * Indicate that this section is dynamic, and answers should be pulled from an array
	 * @returns {boolean}
	 */
	get isDynamicSection() {
		return true;
	}
}
