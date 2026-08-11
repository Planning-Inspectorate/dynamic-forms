# Dynamics Forms

This package is for building [GOV.UK Frontend](https://design-system.service.gov.uk/) forms using a configuration-based approach. It allows you to define a set of questions, and combine them into journeys. Questions can be configured to be included conditionally, based on the answers to other questions.

The functionality for ['check-your-answers'](https://design-system.service.gov.uk/patterns/check-answers/) pages can also be useful for generating pages outside the context of a journey or form, such as for managing data. Each row shown on the page can include a link to edit that data.

> Note this is ported from Appeals: [dynamic forms](https://github.com/Planning-Inspectorate/appeal-planning-decision/tree/a46f945047dc1f13d523a0853b4fcbb4bd0f6d6e/packages/forms-web-app/src/dynamic-forms), but transformed for ES6 modules and Node Test Runner. Not all functionality has been brought across, such as 'add more'.
> It is hoped that this version can be developed over time so Appeals can move to this version.

## Getting started

In summary:

1. Install the package: `npm install --save @planning-inspectorate/dynamic-forms`
2. Configure nunjucks
3. (optional) Configure accessible-autocomplete
4. Add the question and check-your-answers templates
5. Configure questions, journeys, and routes

For more details, see the [Getting started](./docs/Getting%20Started.md) guide.

## Terminology

| Term       | Description                                                                                                          |
|------------|----------------------------------------------------------------------------------------------------------------------|
| Component  | A reusable part of a user interface. Usually forming the main content of a page in the context of a user journey.    |
| Question   | An instantiated component with associated configuration, a specific question within a journey                        |
| Section    | A group of questions, configured with any conditional logic                                                          |
| Journey    | An entire set of questions and sections which make up a user journey                                                 |
| Answer     | Data input by a user against a specific Question                                                                     |
| Response   | A collection of answers submitted as part of a Journey                                                               |
| Validation | Verification that an individual Answer meets the criteria of that Question. i.e. String is greater than 3 characters |

## Usage

The test directory includes a very basic journey in `test/journey.js`. This may be a useful guide for setting up a journey and associated questions. Also in `test/questions.test.js` there is a function `createAppWithQuestions` which may be a useful guide for setting up the appropriate controllers and routes for a journey.

All exports are named exports from the root module:

`import {COMPONENT_TYPES} from '@planning-inspectorate/dynamic-forms`

### Components

Components available are exported via the `COMPONENT_TYPES` constant. 

#### Custom components

Components can be created and used with Dynamic Forms with some configuration. Extend the base `Question` class. 

1. Ensure nunjucks is configured with the folder containing your custom components
2. Export the custom component type names and classes
3. Merge the exported question classes object with the custom classes

See also [Contributing > new components](#new-components)

### Controllers

Dynamic forms includes several Express handlers/controllers which implement the core logic. They all have prerequisites and expect particular properties have been added to the `res.locals` object. These are:

* `res.locals.journey` must be an instance of the `Journey` class
* `res.locals.journeyResponse` must be an instance of the `JourneyResponse` class

They can be added using middleware, and utility functions are available for this, for example:

```typescript
  // get the answers from the session, and add JourneyResponse to `res.locals`
  const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);
  // create the journey with the given journeyResponse and questions, and add to `res.locals`
  const getJourney = buildGetJourney((req, journeyResponse) => createJourney(req, journeyResponse, questions));
  
  router.use(
          getJourneyResponse,
          getJourney
  );
```

The controllers available are:

| Controller     | Purpose                                                                                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| question       | To render a question page as part of a journey                                                                                                                  |
| buildSave      | Returns a controller to handle saving the answer and either redirecting to the next question or show any validation errors if present. Accepts a save function. |
| list/buildList | Renders a check-your-answers page showing all the answers, links to change any answer, and a button to submit the answers.                                      |

### Conditions

Conditions are used to show/hide questions based on the answers to other questions. There are fluent methods on a Section
to add conditions to questions in multiple ways.

The simplest condition applies to just one question:

```javascript
import { whenQuestionHasAnswer } from '@planning-inspectorate/dynamic-forms';

new Section('section-key', 'Section title')
        .addQuestion(questions.q1)
        .addQuestion(questions.q2)
        .withCondition(whenQuestionHasAnswer(questions.q1, 'yes'))
```

In this scenario question two will only be shown if question one has an answer of 'yes'.

Conditions can also be added to an entire section:

```javascript
new Section('section-key', 'Section title')
        .withSectionCondition(whenQuestionHasAnswer(questions.q1, 'yes'))
        .addQuestion(questions.q3)
        .addQuestion(questions.q4)
        .withCondition(whenQuestionHasAnswer(questions.q3, 'yes'))
```

In this case q3 and q4 will only be shown if q1 (from a previous section) is answered 'yes'. Q4 will only show if q1 is
answered 'yes' _and_ q3 is answered 'yes'.

Finally, conditions can be added to multiple questions - these can overlap:

```javascript
new Section('section-key', 'Section title')
        .withSectionCondition(whenQuestionHasAnswer(questions.q1, 'yes'))
        .addQuestion(questions.q2)
        .startMultiQuestionCondition('group-1', whenQuestionHasAnswer(questions.q2, 'valid'))
        .addQuestion(questions.q3)
        .addQuestion(questions.q4)
        .withCondition(whenQuestionHasAnswer(questions.q3, 'yes'))
        .endMultiQuestionCondition('group-1')
        .addQuestion(questions.q5)
        .withCondition(whenQuestionHasAnswer(questions.q4, 'yes'))
        .startMultiQuestionCondition('group-2', whenQuestionHasAnswer(questions.q5, 90))
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

### Validators

Many validators are available such as `RequiredValidator` and `AddressValidator`. More detail on email validation is available in [docs/Email Validation](./docs/Email%20Validation.md).

### Custom Summary Formatting

The `formatSummaryValue` option allows you to customise how answers are displayed on check-your-answers pages without needing to create a custom question class.

#### Basic Usage

Pass a `formatSummaryValue` function when creating a question:

```javascript
import { RadioQuestion } from '@planning-inspectorate/dynamic-forms';

new RadioQuestion({
    fieldName: 'status',
    title: 'Application status',
    question: 'What is the application status?',
    options: [
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' }
    ],
    formatSummaryValue: ({ formattedAnswer }) => `<strong>${formattedAnswer}</strong>`
});
```

#### Formatter Context

The formatter function receives a context object with the following properties:

| Property | Type | Description                                    |
|----------|------|------------------------------------------------|
| `answer` | `unknown` | The raw answer value                           |
| `formattedAnswer` | `string` | The default formatted display value            |
| `question` | `Question` | The question instance                          |
| `journey` | `Journey` | The journey instance                           |
| `sectionSegment` | `string` | The current section segment                    |
| `selectedOptions` | `Option[] \| undefined` | For OptionsQuestions (such as Checkbox or Radio), the matched option object(s) as an array |

#### Answer Formats

Different options-based questions store answers in different formats. The `selectedOptions` array normalises these formats for your formatter:

| Question Type | Answer Format | `selectedOptions` Result |
|---------------|---------------|--------------------------|
| **Radio / Select** | Single string value: `"approved"` | `[{ text: 'Approved', value: 'approved' }]` |
| **Radio / Select** | Conditional object: `{ value: "yes", conditional: "details" }` | `[{ text: 'Yes', value: 'yes', conditional: {...} }]` |
| **Checkbox** | Comma-separated string: `"option1,option2"` | `[{ text: 'Option 1', value: 'option1' }, { text: 'Option 2', value: 'option2' }]` |
| **Checkbox** | Single conditional object: `{ value: "other", conditional: "details" }` | `[{ text: 'Other', value: 'other', conditional: {...} }]` |

For single-select questions (Radio, Select), use `selectedOptions[0]` to access the selected option. For multi-select questions (Checkbox), iterate over the array.

#### Examples

**Bold formatting:**

```javascript
formatSummaryValue: ({ formattedAnswer }) => `<strong>${escapeHtml(formattedAnswer)}</strong>`
```

**Conditional styling based on answer:**

```javascript
formatSummaryValue: ({ selectedOptions }) => {
    const selectedOption = selectedOptions[0];
    const color = selectedOption?.value === 'approved' ? 'green' : 'red';
    return `<span style="color: ${color}">${escapeHtml(selectedOption?.text ?? '-')}</span>`;
}
```

**Adding a suffix from another answer:**

```javascript
const suffixes = { solid: ' (tonnes)', liquid: ' (litres)' };

formatSummaryValue: ({ answer, formattedAnswer }) => {
    const suffix = suffixes[answer] ?? '';
    return `${formattedAnswer}${suffix}`;
}
```

**Accessing other journey answers:**

```javascript
formatSummaryValue: ({ formattedAnswer, journey }) => {
    const capacity = journey.response.answers.wasteCapacity;
    return capacity ? `${formattedAnswer}: ${capacity}` : formattedAnswer;
}
```

**Using selectedOptions for single-select questions (Radio/Select):**

```javascript
formatSummaryValue: ({ selectedOptions }) => {
    const selectedOption = selectedOptions[0];
    // Access the full option object including any custom properties
    const warning = selectedOption?.warning;
    return warning ? `${escapeHtml(selectedOption?.text ?? '-')} ⚠️` : escapeHtml(selectedOption?.text ?? '-');
}
```

**Using selectedOptions for multi-select questions (Checkbox):**

```javascript
formatSummaryValue: ({ selectedOptions }) => {
    // Join all selected option texts with custom formatting
    return selectedOptions
        .map(opt => `<span class="tag">${escapeHtml(opt.text)}</span>`)
        .join(' ');
}
```

> **Note:** `formattedAnswer` is already escaped by dynamic-forms; you are responsible for escaping any additional user-controlled values you include (for example `answer`, option text from `selectedOptions`, or values read from `journey.response.answers`).

## Contributing

When contributing to this package, ensure changes are generic and not service-specific. Speak to the R&D devs if you are not sure. Prefer configuration over hardcoding values, and ensure the code is well documented. 

Commits must follow conventional commits, and the commit types will be used by semantic-release to determine the next version number. For example `feat` commits will result in a minor version bump, while `fix` commits will result in a patch version bump. Major version bumps should be reserved for breaking changes, and should be discussed with the R&D team before being made.

The package will be released automatically using semantic-release, on merge to main. This will include a git tag for the release, and publishing to NPM.

### Type safety
We use JSDocs to describe the types used. This is helpful for the JavaScript developers, and *crucial* for this project being compatible with TypeScript. Type declarations for TypeScript users are auto-generated by `tsc` inline alongside the source files.

**Type definitions:**
- Shared type definitions should be placed in the `typedefs/` folder (e.g. `typedefs/question-types.d.ts`)
- New type definition files need a corresponding empty `.js` file, which needs to be exported from `index.js`, in order to be importable from the package root.
- Types can be imported using path aliases, e.g. `@param {import('#typedefs/question-types.d.ts').SummaryRow[]} rows`

**Best practices:**
1. Always use inline imports for JSDoc types, e.g. `@param {import('#section').Section} section`
2. Avoid top-level `@typedef` imports like `@typedef {import('../validator/base-validator.js')} BaseValidator` - these can create confusion when the compiler auto-generates declarations
3. Maintain `index.js` - if you're adding code that users of this module will import, ensure it is exported in `index.js`

Thank you for your co-operation and contributions!

### Tests

There are some lightweight tests in the `test` directory which sets up a basic journey and checks the rendering for each question as well as redirect logic.

When adding a new question type, be sure to add an example question into `test/questions.js`, and mock answers into `test/questions.test.js#mockAnswerBody` and `test/questions.test.js#mockAnswer`. Also, the question should be added to the journey in `test/journey.js`.

To update any snapshots with rendering changes (or new questions), run `node --test --test-update-snapshots`.

### New components

When implement a new component, extend the base `Question` class. Common methods to override are:

* `formatAnswer` - used for check-your-answers display
* `getDataToSave` - answer data to save
* `addCustomDataToViewModel` - customise the view model with extra data/configuration
* `answerForViewModel` - customise the view model answer value

Where possible `addCustomDataToViewModel` and `answerForViewModel` should be overridden instead of `prepQuestionForRendering`.
