import { Locator, Page } from '@playwright/test';

export class UsersPage {
  readonly loading: Locator;
  readonly empty: Locator;
  readonly error: Locator;
  readonly forbidden: Locator;
  readonly retryButton: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly createButton: Locator;
  readonly readOnlyNote: Locator;
  readonly editButtons: Locator;
  readonly suspendButtons: Locator;
  readonly suspendDialog: Locator;
  readonly suspendConfirm: Locator;
  readonly suspendCancel: Locator;
  readonly suspendError: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId('identity-users-loading');
    this.empty = page.getByTestId('identity-users-empty');
    this.error = page.getByTestId('identity-users-error');
    this.forbidden = page.getByTestId('identity-users-forbidden');
    this.retryButton = page.getByTestId('identity-users-retry-button');
    this.table = page.getByTestId('identity-users-table');
    this.rows = page.getByTestId('identity-users-table-row');
    this.createButton = page.getByTestId('identity-users-create-button');
    this.readOnlyNote = page.getByTestId('identity-users-readonly-note');
    this.editButtons = page.getByTestId('identity-users-table-edit-button');
    this.suspendButtons = page.getByTestId('identity-users-table-suspend-button');
    this.suspendDialog = page.getByRole('dialog');
    this.suspendConfirm = page.getByTestId('identity-suspend-dialog-confirm-button');
    this.suspendCancel = page.getByTestId('identity-suspend-dialog-cancel-button');
    this.suspendError = page.getByTestId('identity-suspend-dialog-error');
  }

  /** The Suspend button in one user's row, found by its accessible name. */
  suspendButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Suspend ${name}` });
  }

  /** The status pill in one user's row. */
  statusOf(name: string): Locator {
    return this.rows.filter({ hasText: name }).getByTestId('identity-users-table-status');
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }
}
