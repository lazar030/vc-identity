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
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }
}
