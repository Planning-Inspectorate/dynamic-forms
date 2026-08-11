# Email Validation

Email validation is provided through the `EmailValidator` class and `EmailQuestion` component. The validator uses express-validator's robust email validation with configurable options.

## Basic Usage

```javascript
import {
	COMPONENT_TYPES,
	createQuestions,
	questionClasses,
	EmailValidator
} from '@planning-inspectorate/dynamic-forms';

// Define question configuration
const questionProps = {
	contactEmail: {
		type: COMPONENT_TYPES.EMAIL,
		title: 'Contact Information',
		question: 'What is your email address?',
		fieldName: 'contactEmail',
		url: 'contact-email',
		label: 'Email address',
		validators: [
			new EmailValidator({
				errorMessage: 'Enter an email address in the correct format, like name@example.com'
			})
		]
	}
};

// Create questions using the factory function
const questions = createQuestions(questionProps, questionClasses, {});
const emailQuestion = questions.contactEmail;
```

The EmailQuestion uses the following default input attributes:

- `type="email"`
- `spellcheck="false"`
- `autocomplete="email"`

## Advanced Validation Options

For stricter email validation requirements:

```javascript
const businessEmailValidator = new EmailValidator({
	options: {
		allowDisplayName: false, // Reject "Name <email@domain.com>" format
		requireTld: true, // Require top-level domain (default: true)
		allowUtf8LocalPart: false, // Only ASCII characters in local part
		allowIpDomain: false // Don't allow IP addresses as domain
	},
	errorMessage: 'Enter a valid business email address'
});
```

## Alternative: Single Line Input with Email Attributes

You can also configure a single line input with email-specific attributes:

```javascript
import {
	COMPONENT_TYPES,
	createQuestions,
	questionClasses,
	EmailValidator
} from '@planning-inspectorate/dynamic-forms';

const questionProps = {
	contactEmail: {
		type: COMPONENT_TYPES.SINGLE_LINE_INPUT,
		title: 'Contact Information',
		question: 'What is your email address?',
		fieldName: 'contactEmail',
		url: 'contact-email',
		label: 'Email address',
		inputAttributes: { type: 'email', spellcheck: 'false' },
		autocomplete: 'email',
		validators: [new EmailValidator()]
	}
};

const questions = createQuestions(questionProps, questionClasses, {});
```
