# Dynamics Forms

This package is for building [GDS](https://design-system.service.gov.uk/) forms using a configuration-based approach. It allows you to define a set of questions, and combine them into journeys. Questions can be configured to be included conditionally, based on the answers to other questions.

The functionality for 'check-your-answers' pages can also be useful for generating pages outside the context of a journey or form, such as for managing data. Each row shown on the page can include a link to edit that data.

> Note this is ported from Appeals: [dynamic forms](https://github.com/Planning-Inspectorate/appeal-planning-decision/tree/a46f945047dc1f13d523a0853b4fcbb4bd0f6d6e/packages/forms-web-app/src/dynamic-forms), but transformed for ES6 modules and Node Test Runner. Not all functionality has been brought across, such as 'add more'.
> It is hoped that this version can be developed over time so Appeals can move to this version.

## Terminology

- Component - A "blueprint" of a type of question. i.e. input, radio button, checkbox etc.
- Question - A specific question within a journey which is made up of one (usually) or many (sometimes) components and
  their required content.
- Section - A group of Questions
- Journey - An entire set of questions required for a completion of a submission
- Answer - Data input by a user against a specific Question.
- Response - a collection of answers submitted as part of a Journey.
- Validation - Verification that an individual Answer meets the criteria of that Question. i.e. String is greater than 3
  characters.

## Requirements

To use this package nunjucks must be configured so that the component view files are available, and static assets must be made available for certain components and styling. Some nunjucks templates are required to correctly render the question pages and task list views.

### Nunjucks

Nunjucks template paths needs configuring with the govuk-frontend and the dynamic forms folder, e.g.

```javascript
import { createRequire } from 'node:module';
import path from 'node:path';
import nunjucks from 'nunjucks';

export function configureNunjucks() {
	// get the require function, see https://nodejs.org/api/module.html#modulecreaterequirefilename
	const require = createRequire(import.meta.url);
	// path to dynamic forms folder
	const dynamicFormsRoot = path.resolve(require.resolve('@planning-inspectorate/dynamic-forms'), '..');
	// get the path to the govuk-frontend folder, in node_modules, using the node require resolution
	const govukFrontendRoot = path.resolve(require.resolve('govuk-frontend'), '../..');
	const appDir = path.join('some/path/to/the', 'app');

	// configure nunjucks
	return nunjucks.configure(
		// ensure nunjucks templates can use govuk-frontend components, and templates we've defined in `web/src/app`
		[dynamicFormsRoot, govukFrontendRoot, appDir],
		{
			// output with dangerous characters are escaped automatically
			autoescape: true,
			// automatically remove trailing newlines from a block/tag
			trimBlocks: true,
			// automatically remove leading whitespace from a block/tag
			lstripBlocks: true
		}
	);
}

```

### Assets

The select component can use the [accessible-autocomplete](https://www.npmjs.com/package/accessible-autocomplete) package. This requires configuring, the component assumes the following paths are available:

* `/assets/css/accessible-autocomplete.min.css`
* `/assets/js/accessible-autocomplete.min.js`

### Layouts

There are two layout files that need to be configured for dynamic-forms: journey and task list.

**Journey template**

The journey template is used for question pages. It must include a block called `dynQuestionContent`, and a block called `head` (which the default gov.uk template has).
It should also include the rendering of the errorSummary component. The path to this template is configured via the `journeyTemplate` property on a Journey.

e.g.

```nunjucks
{% extends "govuk/template.njk" %}

{% block beforeContent %}
    {% if errorSummary %}
        <div class="govuk-grid-row">
            <div class="govuk-grid-column-two-thirds">
                {{ govukErrorSummary({
                    titleText: "There is a problem",
                    errorList: errorSummary,
                    attributes: {"data-cy": "error-wrapper"}
                }) }}
            </div>
        </div>
    {% endif %}
{% endblock %}

{% block content %}
    <div class="govuk-grid-row">
        <div class="govuk-grid-column-full">
            <h1 class="govuk-heading-xl">
                {% if pageCaption %}
                    <span class="govuk-caption-xl">{{ pageCaption }}</span>
                {% endif %}
                {{ pageHeading }}
            </h1>
        </div>
    </div>
    
    {% block dynQuestionContent %}{% endblock %}
{% endblock %}
```

**Task list template**

The task list template is used for the task list or "check your answers" page. It must include a block called `dynTaskList`. The path to this template is configured via the `taskListTemplate` property on a Journey.

e.g.

```nunjucks
{% extends "govuk/template.njk" %}

{% block content %}
    <div class="govuk-grid-row">
        <div class="govuk-grid-column-full">
            <h1 class="govuk-heading-xl">
                {% if pageCaption %}
                    <span class="govuk-caption-xl">{{ pageCaption }}</span>
                {% endif %}
                {{ pageHeading }}
            </h1>
        </div>
    </div>
    
    {% block dynTaskList %}{% endblock %}
{% endblock %}
```

## Usage

The test directory includes a very basic journey in `test/journey.js`. This may be a useful guide for setting up a journey and associated questions. Also in `test/questions.test.js` there is a function `createAppWithQuestions` which may be a useful guide for setting up the appropriate controllers and routes for a journey.

### Conditions

Conditions are used to show/hide questions based on the answers to other questions. There are fluent methods on a Section
to add conditions to questions in multiple ways.

The simplest condition applies to just one question:

```javascript
import { questionHasAnswer } from '@pins/dynamic-forms/src/components/utils/question-has-answer';

new Section('section-key', 'Section title')
        .addQuestion(questions.q1)
        .addQuestion(questions.q2)
        .withCondition((response) => questionHasAnswer(response, questions.q1, 'yes'))
```

In this scenario question two will only be shown if question one has an answer of 'yes'.

Conditions can also be added to an entire section:

```javascript
new Section('section-key', 'Section title')
        .withSectionCondition((response) => questionHasAnswer(response, questions.q1, 'yes'))
        .addQuestion(questions.q3)
        .addQuestion(questions.q4)
        .withCondition((response) => questionHasAnswer(response, questions.q3, 'yes'))
```

In this case q3 and q4 will only be shown if q1 (from a previous section) is answered 'yes'. Q4 will only show if q1 is
answered 'yes' _and_ q3 is answered 'yes'.

Finally, conditions can be added to multiple questions - these can overlap:

```javascript
new Section('section-key', 'Section title')
        .withSectionCondition((response) => questionHasAnswer(response, questions.q1, 'yes'))
        .addQuestion(questions.q2)
        .startMultiQuestionCondition('group-1', (response) => questionHasAnswer(response, questions.q2, 'valid'))
        .addQuestion(questions.q3)
        .addQuestion(questions.q4)
        .withCondition((response) => questionHasAnswer(response, questions.q3, 'yes'))
        .endMultiQuestionCondition('group-1')
        .addQuestion(questions.q5)
        .withCondition((response) => questionHasAnswer(response, questions.q4, 'yes'))
        .startMultiQuestionCondition('group-2', (response) => questionHasAnswer(response, questions.q5, 90))
        .addQuestion(questions.q6)
        .addQuestion(questions.q7)
        .endMultiQuestionCondition('group-2')
```

These conditions combine with individual conditions and section conditions. In the above scenario, the following applies:

| Question | Section Condition | Group Conditions | Question Conditions |
|----------|-------------------|------------------|---------------------|
| q2       | q1 = 'yes'        | N/A              | N/A                 |
| q3       | q1 = 'yes'        | q2 = 'valid'     | N/A                 |
| q4       | q1 = 'yes'        | q2 = 'valid'     | q3 = 'yes'          |
| q5       | q1 = 'yes'        | N/A              | q4 = 'yes'          |
| q6       | q1 = 'yes'        | q5 = 90          | N/A                 |
| q7       | q1 = 'yes'        | q5 = 90          | N/A                 |



## Contributing

When contributing to this package, ensure changes are generic and not service-specific. Speak to the R&D devs if you are not sure. Prefer configuration over hardcoding values, and ensure the code is well documented. 

Commits must follow conventional commits, and the commit types will be used by semantic-release to determine the next version number. For example `feat` commits will result in a minor version bump, while `fix` commits will result in a patch version bump. Major version bumps should be reserved for breaking changes, and should be discussed with the R&D team before being made.

The package will be released automatically using semantic-release, on merge to main. This will include a git tag for the release, and publishing to NPM.

### Tests

There are some lightweight tests in the `test` directory which sets up a basic journey and checks the rendering for each question as well as redirect logic.

When adding a new question type, be sure to add an example question into `test/questions.js`, and mock answers into `test/questions.test.js#mockAnswerBody` and `test/questions.test.js#mockAnswer`. Also, the question should be added to the journey in `test/journey.js`.

To update any snapshots with rendering changes (or new questions), run `node --test --test-update-snapshots`.