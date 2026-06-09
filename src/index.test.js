import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import * as api from './index.js';

describe('public API', () => {
	it('should re-export key validators and validation utilities', () => {
		assert.equal(typeof api.validate, 'function');
		assert.equal(typeof api.buildValidateBody, 'function');

		assert.equal(typeof api.validationErrorHandler, 'function');
		assert.equal(typeof api.buildValidationErrorHandler, 'function');
		assert.equal(typeof api.expressValidationErrorsToGovUkErrorList, 'function');

		assert.equal(typeof api.BaseValidator, 'function');
		assert.equal(typeof api.RequiredValidator, 'function');
		assert.equal(typeof api.EmailValidator, 'function');
		assert.equal(typeof api.ValidOptionValidator, 'function');
		assert.equal(typeof api.StringValidator, 'function');
		assert.equal(typeof api.NumericValidator, 'function');
		assert.equal(typeof api.DateValidator, 'function');
		assert.equal(typeof api.DateTimeValidator, 'function');
		assert.equal(typeof api.DatePeriodValidator, 'function');
		assert.equal(typeof api.AddressValidator, 'function');
		assert.equal(typeof api.MultiFieldInputValidator, 'function');
		assert.equal(typeof api.UnitOptionEntryValidator, 'function');
		assert.equal(typeof api.ConditionalRequiredValidator, 'function');
		assert.equal(typeof api.ConfirmationCheckboxValidator, 'function');
		assert.equal(typeof api.CoordinatesValidator, 'function');
		assert.equal(typeof api.DocumentUploadValidator, 'function');
		assert.equal(typeof api.SameAnswerValidator, 'function');
	});

	it('should re-export key utility functions', () => {
		assert.equal(typeof api.buildSaveDataToSession, 'function');
		assert.equal(typeof api.saveDataToSession, 'function');
		assert.equal(typeof api.clearDataFromSession, 'function');
		assert.equal(typeof api.buildGetJourneyResponseFromSession, 'function');

		assert.equal(typeof api.nl2br, 'function');
		assert.equal(typeof api.capitalize, 'function');
		assert.equal(typeof api.trimTrailingSlash, 'function');
		assert.equal(typeof api.toArray, 'function');

		assert.equal(typeof api.getPersistedNumberAnswer, 'function');
		assert.equal(typeof api.getConditionalFieldName, 'function');
		assert.equal(typeof api.getConditionalAnswer, 'function');
		assert.equal(typeof api.conditionalIsJustHTML, 'function');
	});

	it('should re-export key top-level classes and factories', () => {
		assert.equal(typeof api.Question, 'function');
		assert.equal(typeof api.createQuestions, 'function');
		assert.equal(typeof api.questionClasses, 'object');
		assert.equal(typeof api.Section, 'function');
		assert.equal(typeof api.Journey, 'function');
		assert.equal(typeof api.JourneyResponse, 'function');
	});

	it('should re-export component questions and helpers', () => {
		assert.equal(typeof api.AddressQuestion, 'function');
		assert.equal(typeof api.BooleanQuestion, 'function');
		assert.equal(typeof api.CheckboxQuestion, 'function');
		assert.equal(typeof api.DateQuestion, 'function');
		assert.equal(typeof api.DatePeriodQuestion, 'function');
		assert.equal(typeof api.DateTimeQuestion, 'function');
		assert.equal(typeof api.EmailQuestion, 'function');
		assert.equal(typeof api.ManageListQuestion, 'function');
		assert.equal(typeof api.MultiFieldInputQuestion, 'function');
		assert.equal(typeof api.NumberEntryQuestion, 'function');
		assert.equal(typeof api.RadioQuestion, 'function');
		assert.equal(typeof api.SelectQuestion, 'function');
		assert.equal(typeof api.SingleLineInputQuestion, 'function');
		assert.equal(typeof api.TextEntryQuestion, 'function');
		assert.equal(typeof api.TextEntryRedactQuestion, 'function');
		assert.equal(typeof api.UnitOptionEntryQuestion, 'function');

		assert.equal(typeof api.BOOLEAN_OPTIONS, 'object');
		assert.equal(typeof api.yesNoToBoolean, 'function');
		assert.equal(typeof api.booleanToYesNoValue, 'function');
		assert.equal(typeof api.booleanToYesNoOrNull, 'function');
		assert.equal(typeof api.REDACT_CHARACTER, 'string');
		assert.equal(typeof api.TRUNCATED_MAX_LENGTH, 'number');
	});
});
