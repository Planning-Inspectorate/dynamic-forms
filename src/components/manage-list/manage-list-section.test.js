import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { ManageListSection } from '#src/components/manage-list/manage-list-section.js';
import { Section } from '#src/section.js';

describe('components/manage-list/manage-list-section', () => {
	it('should extend Section', () => {
		assert.ok(ManageListSection.prototype instanceof Section);
	});
	it('should implement isManageListSection', () => {
		const mls = new ManageListSection();
		assert.strictEqual(mls.isManageListSection, true);
	});
	it('should mark each question with isInManagedListSection', () => {
		const mls = new ManageListSection();
		const mockSetter = mock.fn();
		const q = {
			set isInManagedListSection(value) {
				mockSetter(value);
			}
		};
		mls.addQuestion(q);
		assert.strictEqual(mockSetter.mock.callCount(), 1);
		assert.strictEqual(mockSetter.mock.calls[0].arguments[0], true);
	});
	it('should not allow nested manage list questions', () => {
		const mls = new ManageListSection();
		const q = {
			get isManageListQuestion() {
				return true;
			}
		};
		assert.throws(
			() => mls.addQuestion(q),
			(thrown) => {
				assert.strictEqual(thrown.message, 'manage list sections do not support nested managed list questions');
				return true;
			}
		);
	});
	it('should not allow passing nested manageListSection', () => {
		const mls = new ManageListSection();
		const q = {};
		assert.throws(
			() => mls.addQuestion(q, {}),
			(thrown) => {
				assert.strictEqual(thrown.message, 'manage list sections do not support nested managed list questions');
				return true;
			}
		);
	});
});
