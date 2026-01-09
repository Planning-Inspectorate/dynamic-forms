export function getConditionalFieldName(parentField: any, conditionalField: any): string;
export function getConditionalAnswer(answers: any, question: any, answer: any): any;
/**
 * @param {unknown} conditional
 * @returns {conditional is {html: string}}
 */
export function conditionalIsJustHTML(conditional: unknown): conditional is {
	html: string;
};
declare namespace _default {
	export { getConditionalAnswer };
	export { getConditionalFieldName };
}
export default _default;
