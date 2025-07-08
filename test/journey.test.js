import { describe, it } from 'node:test';
import assert from 'assert';
import { createJourney } from './journey.js';
import { getQuestions } from './questions.js';

// Mock response object (empty for this test)
const response = {};

describe('Journey', function () {
	it('should have all questions defined on the journey', function () {
		// Use the questions from the questions module
		const questions = getQuestions();
		const journey = createJourney(questions, response);
		const journeyQuestions = journey.sections[0].questions;
		let previousQuestion = null;
		for (const question of journeyQuestions) {
			assert.ok(question, `Question is not defined, after: ${previousQuestion && previousQuestion.title}`);
			previousQuestion = question;
		}
	});
});
