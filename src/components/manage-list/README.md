# Manage list

The manage list component uses a similar "add to a list" pattern found in other design systems, including:

- [Ministry of Justice
  Design System](https://design-patterns.service.justice.gov.uk/patterns/add-to-a-list/)
- [HM Revenue & Customs
  Design resources](https://design.tax.service.gov.uk/hmrc-design-patterns/add-to-a-list/)
- [Home Office User-Centred Design Manual](https://design.homeoffice.gov.uk/design-system/patterns/help-users-to/add-multiple-things)

Users are able to:
 - repeat a small journey to add multiple items into a list
 - change items in the list
 - remove items from the list
 - check their answers

The question view is the check-your-answers page, which by default shows a summary list. The summary list has the value for the item added, and action links for editing or removing the item.

## Usage

To use the manage list component, configure a question for the manage list and for each question within the "add to list" journey. The questions for the manage list journey are added to a `ManageListSection` and passed to `Section.addQuestion`. For example:

### 1. Set up the questions 

```js
// Define question configuration
const questionProps = {
  // ... other questions
  // manage list question
  holidayActivitiesList: {
    type: COMPONENT_TYPES.MANAGE_LIST,
    title: 'Holiday Activities',
    question: 'Holiday Activities',
    fieldName: 'holidayActivitiesList',
    url: 'holiday-activities-list'
  },
  // other questions to use for each item in the list
  holidayActivityType: {
    type: COMPONENT_TYPES.CHECKBOX,
    title: 'Holiday Activity Type',
    question: 'Which type of holiday activity is it?',
    fieldName: 'holidayActivityType',
    url: 'holiday-activity-type',
    options: [
      { value: 'swimming', text: 'Swimming' },
      { value: 'hiking', text: 'Hiking' },
      { value: 'sightseeing', text: 'Sightseeing' }
    ]
  },
  holidayActivityDate: {
    type: COMPONENT_TYPES.DATE,
    title: 'Holiday Activity Date',
    question: 'On which date will you do the holiday activity?',
    fieldName: 'holidayActivityDate',
    url: 'holiday-activity-date'
  }
};
```

### 2. Set up the section within the journey

You can use conditional logic in the `ManageListSection` (see [Conditions](#conditions))

```js
new Section('New Holiday', 'holiday')
  .addQuestion(questions.holidayDestination)
  // add a manage list question like any other, but include the `ManageListSection` as well
  .addQuestion(
        questions.holidayActivitiesList,
        new ManageListSection()
            .addQuestion(questions.holidayActivityType)
            .addQuestion(questions.holidayActivityDate)
  )
  .addQuestion(questions.departureDate)
  .addQuestion(questions.holidayPeriod)
  ```

### 3. Add extra route parameters

`{/:manageListAction/:manageListItemId/:manageListQuestion}` optional route parameters are added to the get and post routes for questions

```js
router.get('/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
        getJourneyResponse,
        getJourney,
        question
);

router.post(
        '/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
        getJourneyResponse,
        getJourney,
        validate,
        validationErrorHandler,
        buildSave(saveDataToSession)
);
```

### Conditions

The usual conditions can be used in a `ManageListSection`. However, only answers in the `ManageListSection` will be available to check, not answers for main the journey. For example:

```js
new Section('New Holiday', 'holiday')
        .addQuestion(questions.holidayDestination)
        // add a manage list question like any other, but include the `ManageListSection` as well
        .addQuestion(
                questions.holidayActivitiesList,
                new ManageListSection()
                        .addQuestion(questions.holidayActivityType)
                        .addQuestion(questions.holidayActivityDate)
                        .withCondition(whenQuestionHasAnswer(questions.holidayActivityType, 'swimming'))
        )
        .addQuestion(questions.departureDate)
        .addQuestion(questions.holidayPeriod)
```
