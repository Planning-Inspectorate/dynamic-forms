import type { Request, Response, NextFunction } from 'express';

// ===== Type Definitions =====

export interface Address {
	addressLine1?: string;
	addressLine2?: string;
	townCity?: string;
	county?: string;
	postcode?: string;
}

export interface JourneyResponse {
	answers: Record<string, any>;
}

export interface Journey {
	getQuestionBySectionAndName(section: string, name: string): Question | undefined;
}

export interface Section {
	[key: string]: any;
}

export declare abstract class BaseValidator {
	validate(value: any, question: Question, journeyResponse: JourneyResponse): boolean | Promise<boolean>;
}

export interface PreppedQuestion {
	value: any;
	question: string;
	fieldName: string;
	pageTitle: string;
	description?: string;
	html?: string;
}

export interface QuestionViewModel {
	question: PreppedQuestion;
	layoutTemplate: string;
	pageCaption: string;
	continueButtonText?: string;
	navigation: string[];
	backLink: string;
	showBackToListLink: boolean;
	listLink: string;
}

export declare class Question {
	pageTitle?: string;
	title: string;
	question: string;
	description?: string;
	viewFolder: string;
	fieldName: string;
	taskList: boolean;
	validators: BaseValidator[];
	hint?: string;
}

// ===== Component Types =====

export declare const COMPONENT_TYPES: {
	readonly CHECKBOX: 'checkbox';
	readonly BOOLEAN: 'boolean';
	readonly RADIO: 'radio';
	readonly DATE: 'date';
	readonly DATE_PERIOD: 'date-period';
	readonly DATE_TIME: 'date-time';
	readonly TEXT_ENTRY: 'text-entry';
	readonly TEXT_ENTRY_REDACT: 'text-entry-redact';
	readonly SELECT: 'select';
	readonly SINGLE_LINE_INPUT: 'single-line-input';
	readonly MULTI_FIELD_INPUT: 'multi-field-input';
	readonly NUMBER: 'number';
	readonly ADDRESS: 'site-address';
	readonly UNIT_OPTION: 'unit-option';
	readonly EMAIL: 'email';
};

// ===== Question Classes =====

export declare class AddressQuestion extends Question {}
export declare class BooleanQuestion extends Question {}
export declare class CheckboxQuestion extends Question {}
export declare class DateQuestion extends Question {}
export declare class DatePeriodQuestion extends Question {}
export declare class MultiFieldInputQuestion extends Question {}
export declare class NumberEntryQuestion extends Question {}
export declare class RadioQuestion extends Question {}
export declare class SelectQuestion extends Question {}
export declare class SingleLineInputQuestion extends Question {}
export declare class TextEntryQuestion extends Question {}
export declare class TextEntryRedactQuestion extends Question {}
export declare class UnitOptionEntryQuestion extends Question {}
export declare class OptionsQuestion extends Question {}

// ===== Validators =====

export declare class AddressValidator extends BaseValidator {}
export declare class ConditionalRequiredValidator extends BaseValidator {}
export declare class ConfirmationCheckboxValidator extends BaseValidator {}
export declare class CoordinatesValidator extends BaseValidator {}
export declare class DatePeriodValidator extends BaseValidator {}
export declare class DateTimeValidator extends BaseValidator {}
export declare class DateValidator extends BaseValidator {}
export declare class DocumentUploadValidator extends BaseValidator {}
export declare class EmailValidator extends BaseValidator {}
export declare class MultiFieldInputValidator extends BaseValidator {}
export declare class NumericValidator extends BaseValidator {}
export declare class RequiredFileUploadValidator extends BaseValidator {}
export declare class RequiredValidator extends BaseValidator {}
export declare class SameAnswerValidator extends BaseValidator {}
export declare class StringValidator extends BaseValidator {}
export declare class UnitOptionEntryValidator extends BaseValidator {}
export declare class ValidOptionValidator extends BaseValidator {}

// ===== Utility Functions =====

/**
 * Logical combinations helper for checking question answers
 */
export declare const logicalCombinations: (response: JourneyResponse) => {
	and: (questionKeyTuples: [any, unknown][]) => boolean;
	or: (questionKeyTuples: [any, unknown][]) => boolean;
};

/**
 * Check if a question has a specific answer value
 */
export declare function questionHasAnswer(response: JourneyResponse, question: any, expectedValue: unknown): boolean;

/**
 * Check if any item in the specified answer field matches a condition
 */
export declare function questionHasAnswerInAnswerField(
	response: JourneyResponse,
	answerFieldKey: string,
	answerFieldValueKey: string,
	expectedValue: unknown
): boolean;

/**
 * Various question utility functions
 */
export declare function getPersistedAnswer(journeyResponse: JourneyResponse, key: string): number | undefined;
export declare function addNumberToPersistedAnswer(
	journeyResponse: JourneyResponse,
	key: string,
	numberToAdd: number
): void;

// ===== Journey Classes =====

export declare class Journey {
	getQuestionBySectionAndName(section: string, name: string): Question | undefined;
}

export declare class JourneyResponse {
	answers: Record<string, any>;
}

// ===== Functions =====

/**
 * Create questions from configuration
 */
export declare function createQuestions(config: any): Question[];

/**
 * Get question classes mapping
 */
export declare const questionClasses: Record<string, typeof Question>;

// ===== Middleware Functions =====

export declare function buildGetJourney(options: any): (req: Request, res: Response, next: NextFunction) => void;
export declare function checkNotSubmitted(req: Request, res: Response, next: NextFunction): void;
export declare function dynamicReqFilesToReqBodyFiles(req: Request, res: Response, next: NextFunction): void;
export declare function redirectToUnansweredQuestion(req: Request, res: Response, next: NextFunction): void;

// ===== Validation =====

/**
 * Main validation middleware function
 */
declare const validate: (req: Request, res: Response, next: NextFunction) => Promise<void>;

export { validate as default };
export { validate };

/**
 * Build validation body function
 */
export declare function buildValidateBody(questions: Question[]): any;

// ===== Address Utils =====

export declare function formatAddress(address: Address, options?: { htmlLineBreaks?: boolean }): string;

// ===== Date Utils =====

export declare function formatDate(date: Date | string, format?: string): string;
export declare function parseDateFromString(dateString: string): Date | null;

// ===== General Utils =====

export declare function capitalize(str: string): string;
export declare function nl2br(str: string): string;

// ===== Session Answer Store =====

export declare class SessionAnswerStore {
	[key: string]: any;
}

// ===== Validation Error Handler =====

export declare function validationErrorHandler(error: any): any;
