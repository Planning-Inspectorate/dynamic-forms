import { Question } from '#question';
import nunjucks from 'nunjucks';

/**
 * Generic Upload class that takes a file and sends it to a given endpoint.
 * If `session` contains any `uploadedFiles` those will show in the list.
 * It will then show any of these files in the summary list.
 * @typedef {import('./question-types.js').QuestionParameters} QuestionParameters
 * @typedef {Object} UploadQuestionConfig
 * @property {Array<string>} allowedFileExtensions
 * @property {Array<string>} allowedMimeTypes
 * @property {number} maxFileSizeValue
 * @property {string} maxFileSizeString
 * @property {boolean} showUploadWarning
 */
export default class UploadQuestion extends Question {
	/**
	 * Creates a new generic file upload question.
	 * @param {Omit<QuestionParameters, 'viewFolder'> & UploadQuestionConfig & { viewFolder?: string }} options - Configuration for the upload component, including limits and UI flags.
	 */
	constructor(options) {
		super({
			...options,
			viewFolder: 'upload'
		});

		this.allowedFileExtensions = options.allowedFileExtensions;
		this.allowedMimeTypes = options.allowedMimeTypes;
		this.maxFileSizeValue = options.maxFileSizeValue;
		this.maxFileSizeString = options.maxFileSizeString;
		this.showUploadWarning = options.showUploadWarning;
	}

	/**
	 * Hydrates the view model used to render the Nunjucks template.
	 * This attaches previously uploaded files, encodes them for hidden form state,
	 * and passes down the file size/type constraints.
	 * @param {Object} options - The context required to build the view model.
	 * @param {Object} options.params - Route parameters (e.g., req.params).
	 * @param {Object} [options.manageListQuestion] - Related manage list context, if applicable.
	 * @param {Object} options.section - The current section of the journey.
	 * @param {Object} options.journey - The user's journey tracker.
	 * @param {Object} [options.customViewData] - Any custom data injected by the controller or a child class.
	 * @param {Object} [options.payload] - The current request body payload.
	 * @returns {Object} The fully prepared view model ready for Nunjucks.
	 */
	toViewModel({ params, manageListQuestion, section, journey, customViewData, payload }) {
		const viewModel = super.toViewModel({ params, manageListQuestion, section, journey, customViewData, payload });

		const uploadedFiles = this._extractUploadedFiles(customViewData, params);

		viewModel.question.value = this._resolveQuestionValue(journey, payload, viewModel.question.value);
		viewModel.uploadedFiles = uploadedFiles;
		viewModel.uploadedFilesEncoded = this._encodeFiles(uploadedFiles);

		this._attachConfigToViewModel(viewModel);

		return viewModel;
	}

	/**
	 * Inspects the current request to see if there are any validation errors
	 * from Multer (session) or standard express-validator (body).
	 * @param {import('express').Request} req - The Express request object.
	 * @param {Object} section - The current section of the journey.
	 * @param {Object} journey - The user's journey tracker.
	 * @param {Object} [manageListQuestion] - Related manage list context.
	 * @returns {Object|undefined} The view model populated with errors, or undefined if the request is clean.
	 */
	checkForValidationErrors(req, section, journey, manageListQuestion) {
		const session = this._normaliseSession(req.session);
		const bodyErrors = req.body?.errors || {};
		const bodyErrorSummary = req.body?.errorSummary || [];

		const hasBodyErrors = bodyErrorSummary.length > 0;
		const hasSessionErrors = session.errorSummary.length > 0;

		if (!hasBodyErrors && !hasSessionErrors) {
			return;
		}

		return this.toViewModel({
			params: req.params,
			manageListQuestion,
			section,
			journey,
			customViewData: {
				id: req.params.id,
				currentUrl: req.originalUrl,
				files: session.files,
				errors: hasBodyErrors ? bodyErrors : session.errors,
				errorSummary: hasBodyErrors ? bodyErrorSummary : session.errorSummary
			}
		});
	}

	/**
	 * Formats the uploaded files into a rendered HTML block
	 * to be displayed on a "Check your answers" or Summary page.
	 * @param {string} sectionSegment - The URL segment for the current section.
	 * @param {Object} journey - The user's journey tracker.
	 * @param {Array<Object>} answer - The array of uploaded file objects.
	 * @returns {Array<Object>} An array containing the summary list row configuration.
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		if (!this._hasFiles(answer)) {
			return [this._createSummaryRow(this.notStartedText, sectionSegment, journey, answer)];
		}

		const baseUrl = journey?.baseUrl || '/manage';
		const items = this._mapFilesToSummaryItems(answer, baseUrl);

		const formattedAnswer = nunjucks.render(`./components/upload/files-list.njk`, { items });

		// NB: the below is for local development, I found that there were some issues with symlinking
		// to the above. So the 3 lines below will manually point to the correct path.

		// const templatePath = path.resolve(__dirname, './files-list.njk');
		// const templateString = fs.readFileSync(templatePath, 'utf-8');
		// const formattedAnswer = nunjucks.renderString(templateString, { items });

		return [this._createSummaryRow(formattedAnswer, sectionSegment, journey, answer)];
	}

	/**
	 * Extracts the uploaded files out of the session so they can be saved
	 * to the database or journey response object.
	 *
	 * By default we will check for uploadedFiles in the session inside of:
	 * files.<caseId>.<currentFieldName> - sub classes will need to overwrite
	 * this function if that doesn't work for their setup.
	 *
	 * @param {import('express').Request} req - The Express request object.
	 * @param {Object} journeyResponse - The user's current response payload.
	 * @returns {Promise<{answers: Record<string, Array>}>} An object containing the answers to save.
	 */
	async getDataToSave(req, journeyResponse) {
		const id = req.params.id;
		const uploadedFiles = req.session.files?.[id]?.[this.fieldName]?.uploadedFiles || [];

		journeyResponse.answers[this.fieldName] = uploadedFiles;
		return { answers: { [this.fieldName]: uploadedFiles } };
	}

	/**
	 * Determines the current value of the question, handling "Edit" mode edge cases.
	 * @private
	 * @param {Object} journey - The user's journey tracker.
	 * @param {Object} payload - The current request body payload.
	 * @param {unknown} fallbackValue - The fallback value if no payload exists.
	 * @returns {unknown} The resolved value.
	 */
	_resolveQuestionValue(journey, payload, fallbackValue) {
		const isEdit = Boolean(journey?.baseUrl?.endsWith('/edit'));
		if (isEdit) return payload ? payload[this.fieldName] : [];
		return payload ? payload[this.fieldName] : fallbackValue;
	}

	/**
	 * Safely hunts down the uploaded files, checking custom view data first,
	 * then falling back to the standard session pathing.
	 * @private
	 * @param {Object} customViewData - Data injected during toViewModel.
	 * @param {Object} params - Route parameters.
	 * @returns {Array<Object>} The array of files, or an empty array if none found.
	 */
	_extractUploadedFiles(customViewData, params) {
		if (customViewData?.uploadedFiles) return customViewData.uploadedFiles;

		const id = customViewData?.id || params?.id;
		return customViewData?.files?.[id]?.[this.fieldName]?.uploadedFiles || [];
	}

	/**
	 * Converts the files array into a Base64 string so it can be passed into a hidden
	 * HTML input. This preserves state if the page reloads due to validation errors.
	 * @private
	 * @param {Array<Object>} files - The array of uploaded files.
	 * @returns {string} A Base64 encoded JSON string.
	 */
	_encodeFiles(files) {
		return Buffer.from(JSON.stringify(files || []), 'utf-8').toString('base64');
	}

	/**
	 * Mutates the view model to attach all the specific file constraints
	 * (size, type, warnings) so the Nunjucks template can render hints/attributes.
	 * @private
	 * @param {Object} viewModel - The view model being prepared.
	 */
	_attachConfigToViewModel(viewModel) {
		Object.assign(viewModel.question, {
			allowedFileExtensions: this.allowedFileExtensions,
			allowedMimeTypes: this.allowedMimeTypes,
			maxFileSizeValue: this.maxFileSizeValue,
			maxFileSizeString: this.maxFileSizeString,
			showUploadWarning: this.showUploadWarning
		});
	}

	/**
	 * Sanitizes the session object to guarantee `files`, `errors`, and `errorSummary`
	 * always exist and are of the correct type, preventing random 'undefined' crashes.
	 * @private
	 * @param {unknown} session - The raw session object.
	 * @returns {{files: Object, errorSummary: Array, errors: Object}} A sanitized session object.
	 */
	_normaliseSession(session) {
		return {
			files: typeof session?.files === 'object' && session.files !== null ? session.files : {},
			errorSummary: Array.isArray(session?.errorSummary) ? session.errorSummary : [],
			errors: typeof session?.errors === 'object' && session.errors !== null ? session.errors : {}
		};
	}

	/**
	 * Checks if the provided answer actually contains any valid file objects.
	 * @private
	 * @param {unknown} answer - The answer payload to check.
	 * @returns {boolean} True if files exist, false otherwise.
	 */
	_hasFiles(answer) {
		return Boolean(answer && Array.isArray(answer) && answer.length > 0);
	}

	/**
	 * Constructs a single row object shaped perfectly for the GOV.UK Summary List macro.
	 * @private
	 * @param {string} value - The HTML or text value to display in the row.
	 * @param {string} sectionSegment - The URL segment for the current section.
	 * @param {Object} journey - The user's journey tracker.
	 * @param {unknown} answer - The user's current answer.
	 * @returns {Object} The formatted summary row.
	 */
	_createSummaryRow(value, sectionSegment, journey, answer) {
		const action = super.getAction(sectionSegment, journey, answer);
		return { key: this.title, value, action };
	}

	/**
	 * Maps the internal file objects into standard items for the Nunjucks list template.
	 * Generates standard view links for each file based on the journey URL.
	 * @private
	 * @param {Array<Object>} files - The raw file objects.
	 * @param {string} baseUrl - The base URL for generating view links.
	 * @returns {Array<{href: string, name: string}>} The mapped items.
	 */
	_mapFilesToSummaryItems(files, baseUrl) {
		return files.map(({ itemId, id, fileName }) => ({
			href: itemId || id ? `${baseUrl}/task-list/${itemId || id}/view` : '#',
			name: fileName || ''
		}));
	}
}
