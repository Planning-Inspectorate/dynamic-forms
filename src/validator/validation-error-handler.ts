import { type ResultFactory, type ValidationError, validationResult } from 'express-validator';
import type { Handler } from 'express';

export type GovUkErrorList = { text: string; href: string }[];
export type ExpressValidationErrors = Record<string, ValidationError>;
export type ToErrorSummary = (errors: ExpressValidationErrors) => GovUkErrorList;

export const expressValidationErrorsToGovUkErrorList: ToErrorSummary = (expressValidationErrors) => {
	const mappedErrors: GovUkErrorList = [];

	if (Object.keys(expressValidationErrors).length === 0) {
		return mappedErrors;
	}

	Object.keys(expressValidationErrors).forEach((key) => {
		mappedErrors.push({
			text: expressValidationErrors[key].msg,
			href: `#${key}`
		});
	});

	return mappedErrors;
};

/**
 *
 * @param [validate] - for testing
 * @param [toErrorSummary] - for testing
 */
export const buildValidationErrorHandler = (
	validate: ResultFactory<ValidationError> = validationResult,
	toErrorSummary: ToErrorSummary = expressValidationErrorsToGovUkErrorList
): Handler => {
	return (req, res, next) => {
		const errors = validate(req);

		if (errors.isEmpty()) {
			return next();
		}

		const mappedErrors = errors.mapped();

		// date-validator returns some empty error messages to avoid having an error for each field
		// there is probably a better way but we shouldn't block with an empty error anyway
		const filteredErrors = Object.entries(mappedErrors).filter(([, error]) => error.msg);
		if (filteredErrors.length === 0) return next();

		const mappedAndFilteredErrors = Object.fromEntries(filteredErrors);

		req.body.errors = mappedAndFilteredErrors;
		req.body.errorSummary = toErrorSummary(mappedAndFilteredErrors);

		return next();
	};
};

export const validationErrorHandler = buildValidationErrorHandler();
