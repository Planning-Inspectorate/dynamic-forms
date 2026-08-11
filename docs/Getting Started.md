# Getting started

Follow these steps to get started using Dynamic Forms. This guide assumes you have a [Node.js project](https://nodejs.org/) setup with [npm](https://www.npmjs.com/), [expressjs](https://expressjs.com/), [Nunjucks](https://mozilla.github.io/nunjucks/), and the [GOV.UK frontend](https://design-system.service.gov.uk/) already.

## Step 1 - add the package dependency

Add dynamic-forms to your project with npm:

`npm install --save @planning-inspectorate/dynamic-forms`

If you are using the select component with [accessible-autocomplete](https://www.npmjs.com/package/accessible-autocomplete), also install this:

`npm install --save accessible-autocomplete`

## Step 2 - configure the dynamic forms root for Nunjucks

So that the nunjucks rendered can resolve the dynamic forms components, add the root to the nunjucks configuration. For example:

```typescript
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
		// ensure nunjucks templates can use govuk-frontend components, and templates we've defined
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

## Step 3 - add required assets

The select component can use the [accessible-autocomplete](https://www.npmjs.com/package/accessible-autocomplete) package. This requires configuring, the component assumes the following paths are available:

- `/assets/css/accessible-autocomplete.min.css`
- `/assets/js/accessible-autocomplete.min.js`

If you have a build step for static assets, copy the accessible-autocomplete assets into the static folder. For example:

```typescript
/**
 * Copy accessible-autocomplete assets into the static folder
 */
async function copyAutocompleteAssets({ staticDir, root }: AutocompleteOptions): Promise<void> {
	const js = path.join(root, 'accessible-autocomplete.min.js');
	const css = path.join(root, 'accessible-autocomplete.min.css');

	const staticJs = path.join(staticDir, 'assets', 'js', 'accessible-autocomplete.min.js');
	const staticCss = path.join(staticDir, 'assets', 'css', 'accessible-autocomplete.min.css');

	await copyFile(js, staticJs);
	await copyFile(css, staticCss);
}
```

## Step 4 - add the question and check-your-answers templates

Dynamic forms requires two templates to work for rendering questions and rendering check-your-answers page. Different journeys can use different templates if required, but usually they can be shared.

### Journey (or question) template

The journey template is used for question pages. It must include a block called `dynQuestionContent`, and a block called `head` (which the default gov.uk template has).
It should also include the rendering of the errorSummary component. The path to this template is configured via the `journeyTemplate` property on a Journey.

For example:

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

### Task list (or check your answers) template

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

## Step 5 - add questions, journeys, and routes

Now you are ready to implement any user journeys for your service. Add questions, journeys, and routes for each of them.

For example:

`questions.ts`

Use `satisfies Record<string, QuestionProps>` to get autocomplete for available question props specific for each component type.

```typescript
import {
	COMPONENT_TYPES,
	createQuestions,
	questionClasses,
	RequiredValidator
} from '@planning-inspectorate/dynamic-forms';
import type { QuestionProps } from '@planning-inspectorate/dynamic-forms';

export const questionProps = {
	destinationType: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Destination type',
		question: 'Which sort of place would you like to visit?',
		fieldName: 'destinationType',
		url: 'destination-type',
		options: [
			{ value: 'beach', text: 'Beach' },
			{ value: 'mountains', text: 'Mountains' },
			{ value: 'city', text: 'City' }
		],
		validators: [new RequiredValidator('Select a destination type')]
	},
	nights: {
		type: COMPONENT_TYPES.NUMBER,
		title: 'Number of Nights',
		question: 'How many nights will you stay on holiday?',
		fieldName: 'nights',
		url: 'nights',
		label: 'Nights'
	}
} satisfies Record<string, QuestionProps>;

export function getQuestions() {
	return createQuestions(questionProps, questionClasses, {}, {});
}

export type Questions = ReturnType<typeof getQuestions>;
```

`journey.ts`

```typescript
import {
	BOOLEAN_OPTIONS,
	Journey,
	type JourneyResponse,
	Section,
	whenQuestionHasAnswer
} from '@planning-inspectorate/dynamic-forms';
import type { Request } from 'express';
import type { Questions } from './questions.ts';

export const JOURNEY_ID = 'holidays';

export function createJourney(req: Request, response: JourneyResponse, questions: Questions) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [
			new Section('Questions', 'questions').addQuestion(questions.destinationType).addQuestion(questions.nights)
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layouts/question.njk',
		taskListTemplate: 'views/layouts/check-your-answers.njk',
		journeyTitle: 'Holidays',
		returnToListing: false,
		makeBaseUrl: () => req.baseUrl,
		initialBackLink: '/',
		response
	});
}
```

`index.ts`

```typescript
import { Router as createRouter } from 'express';
import type { IRouter } from 'express';
import {
	buildGetJourney,
	buildGetJourneyResponseFromSession,
	buildList,
	buildSave,
	question,
	saveDataToSession,
	validate,
	validationErrorHandler
} from '@planning-inspectorate/dynamic-forms';
import { createJourney, JOURNEY_ID } from './journey.ts';
import { getQuestions } from './questions.ts';

export function createRoutes(): IRouter {
	const router = createRouter({ mergeParams: true });

	const questions = getQuestions();
	const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(req, journeyResponse, questions));

	router.use(getJourneyResponse, getJourney);

	// route for rendering each question
	router.get('/:section/:question', question);
	// route for saving each answer (to session)
	router.post('/:section/:question', validate, validationErrorHandler, buildSave(saveDataToSession));

	// route for check-your-answers page
	router.get('/check-your-answers', buildList());
	// route for saving all answers
	router.post('/check-your-answers', (req, res) => {
		const answers = res.locals?.journeyResponse?.answers as JourneyAnswers;
		if (typeof answers !== 'object' || answers === null) {
			throw new Error('answers should be an object');
		}
		console.log('answers', answers);
		// TODO: save to a database or similar!
		res.redirect('/');
	});

	return router;
}

interface JourneyAnswers {
	destinationType: string;
	nights: number;
}
```

`router.ts`

```typescript
import type { IRouter } from 'express';
import { Router as createRouter } from 'express';
import { viewHomepage } from './views/home/controller.ts';
import { createRoutes as createHolidayRoutes } from './views/holidays/index.ts';

export function buildRouter(): IRouter {
	const router = createRouter();

	router.route('/').get(viewHomepage);

	router.use('/holidays', createHolidayRoutes());

	return router;
}
```
