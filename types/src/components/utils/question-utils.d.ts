/**
 * @typedef {import('../../journey/journey-response').JourneyResponse} JourneyResponse
 */
export function getConditionalFieldName(parentField: any, conditionalField: any): string;
export function getConditionalAnswer(answers: any, question: any, answer: any): any;
/**
 * @param {JourneyResponse} journeyResponse
 * @param {string} fieldName
 */
export function getAddressesForQuestion(journeyResponse: JourneyResponse, fieldName: string): any;
/**
 * @param {JourneyResponse} journeyResponse
 * @param {string} fieldName
 */
export function getLinkedCasesForQuestion(journeyResponse: JourneyResponse, fieldName: string): any;
/**
 * @param {JourneyResponse} journeyResponse
 * @param {string} fieldName
 */
export function getListedBuildingForQuestion(journeyResponse: JourneyResponse, fieldName: string): any;
export function conditionalIsJustHTML(conditional: unknown): conditional is {
	html: string;
};
declare namespace _default {
	export { getAddressesForQuestion };
	export { getConditionalAnswer };
	export { getConditionalFieldName };
	export { getListedBuildingForQuestion };
	export { getLinkedCasesForQuestion };
}
export default _default;
export type JourneyResponse = import('../../journey/journey-response').JourneyResponse;
