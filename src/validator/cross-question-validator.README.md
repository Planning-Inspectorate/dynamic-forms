# Cross-question validator

The `CrossQuestionValidator` enables validation of a question's answer against another question's answer using a custom validation function. This is useful for scenarios where the validity of one answer depends on another answer.

## Constructor options

| Parameter                 | Type                                           | Default      | Description                                                                                    |
| ------------------------- | ---------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `dependencyFieldName`     | `string`                                       | **required** | The field name of the other question to compare against                                        |
| `validationFunction`      | `(currentAnswer, dependencyAnswer) => boolean` | **required** | Function that returns `true` if valid, or throws an `Error` with a specific message if invalid |
| `useBodyValues`           | `boolean`                                      | `false`      | Use `req.body` values for **both** current and dependency answers                              |
| `useBodyValuesForCurrent` | `boolean`                                      | `false`      | Use `req.body` value for current answer only (dependency still uses JourneyResponse)           |

## Use cases

### 1. Validation between separate manage list questions (JourneyResponse data)

When validating between questions where both answers are already saved to the JourneyResponse (e.g., in a manage list journey), use the default settings.

```js
import { CrossQuestionValidator } from '@planning-inspectorate/dynamic-forms';

const startDateQuestion = {
	type: COMPONENT_TYPES.DATE,
	fieldName: 'startDate',
	question: 'What is the start date?'
	// ... other config
};

const endDateQuestion = {
	type: COMPONENT_TYPES.DATE,
	fieldName: 'endDate',
	question: 'What is the end date?',
	validators: [
		new CrossQuestionValidator({
			dependencyFieldName: 'startDate',
			validationFunction: (endDate, startDate) => {
				if (!endDate || !startDate) return true;
				if (new Date(endDate) < new Date(startDate)) {
					throw new Error('End date must be on or after the start date');
				}
				return true;
			}
		})
	]
};
```

**When to use:** Both questions are on separate pages and their answers are saved to the JourneyResponse before validation runs.

### 2. Validation between regular questions (body data with formatting)

When the current question's data needs to be extracted from `req.body` and formatted (e.g., date fields that come as separate day/month/year inputs), use `useBodyValuesForCurrent: true`.

The validator will automatically use the question's `getDataToSave()` method to format the data correctly.

```js
const projectEndDateQuestion = {
	type: COMPONENT_TYPES.DATE,
	fieldName: 'projectEndDate',
	question: 'When does the project end?',
	validators: [
		new CrossQuestionValidator({
			dependencyFieldName: 'projectStartDate', // Already saved in JourneyResponse
			useBodyValuesForCurrent: true, // Current answer from body, formatted via getDataToSave()
			validationFunction: (endDate, startDate) => {
				if (!endDate || !startDate) return true;
				if (endDate < new Date(startDate)) {
					throw new Error('Project end date must be on or after the project start date');
				}
				return true;
			}
		})
	]
};
```

**When to use:** The current question's answer is in `req.body` (not yet saved), but the dependency answer is already saved to the JourneyResponse. Works automatically with date questions, date-period questions, and other question types that have a `getDataToSave()` method.

### 3. Validation between fields in a multi-field question (both from body)

When validating between multiple fields on the same page (e.g., a `MultiFieldInputQuestion`), both current and reference values come from `req.body`. Use `useBodyValues: true`.

```js
const siteAreaQuestion = {
	type: COMPONENT_TYPES.MULTI_FIELD_INPUT,
	fieldName: 'siteArea',
	question: 'What is the area of the site?',
	inputFields: [
		{ fieldName: 'siteAreaHectares', label: 'Site area in hectares (optional)' },
		{ fieldName: 'siteAreaSquareMetres', label: 'Site area in square metres (optional)' }
	],
	validators: [
		// Note: this is a custom validator not provided by default
		new MultiFieldInputValidator({
			fields: [
				{
					fieldName: 'siteAreaHectares',
					validators: [
						new CrossQuestionValidator({
							dependencyFieldName: 'siteAreaSquareMetres',
							useBodyValues: true,
							validationFunction: (hectares, squareMetres) => {
								if (hectares?.trim() && squareMetres?.trim()) {
									throw new Error('Enter the site area in either hectares or square metres, not both');
								}
								return true;
							}
						})
					]
				}
			]
		})
	]
};
```

**When to use:** Multiple fields are on the same page and both values need to be read from `req.body` before either is saved.

## How data sources are determined

| `useBodyValues` | `useBodyValuesForCurrent` | Current Answer Source        | Dependency Answer Source |
| --------------- | ------------------------- | ---------------------------- | ------------------------ |
| `false`         | `false`                   | Session                      | Session                  |
| `false`         | `true`                    | Body (via `getDataToSave()`) | Session                  |
| `true`          | (ignored)                 | Body (via `getDataToSave()`) | Body (raw)               |

## Notes

- When `useBodyValuesForCurrent` is `true`, the validator uses the question's `getDataToSave()` method to format body data. This automatically handles complex field types like dates (`fieldName_day`, `fieldName_month`, `fieldName_year`).
- The validator binds to the appropriate body field based on the question's `viewFolder` (e.g., `fieldName_day` for date questions).
