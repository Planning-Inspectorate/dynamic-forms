# Dynamic Sections

Use a dynamic section for sections which are generated from an array of objects.

This can be useful for adding a section for each entry in a ManageList, or each row in a database. The controller logic, when encountering a DynamicSection, will check for answers within `journeyResponse.answers[section.fieldName]` which is expected to be an array, and it will look for an object with an `id` property matching the sections' segment.

For example, considering a dynamic section for a Person object:

```typescript
function createPersonSection(person) {
	return new DynamicSection(person.name, person.id, 'people').addQuestion(questions.name);
	// ... other questions
}
```

Then the answers object should be of the form:

```typescript
answers = {
	myField: 'some answer', // a normal question field
	people: [
		// dynamic section fields
		{ id: 'person-id-1', name: 'Grogu' },
		{ id: 'person-id-2', name: 'Mando' }
	]
};
```

## Saving data

When using with `buildSave`, be sure to handle the parameters: `isDynamicSection`, `dynamicSectionId`,`dynamicSectionFieldName`. The implementation `buildSaveDataToSession` (in `session-answer-store.js`) may be a useful reference.

```typescript
const buildSaveFn: SaveDataFn = async (params) => {
	if (params.isDynamicSection) {
		// saving a response within a dynamic section
		const itemId = params.dynamicSectionId;
		const listType = params.dynamicSectionFieldName;

		// some logic to save the data for this item
	}
};
```

## Conditions

Question conditions can only access other questions within the section.
