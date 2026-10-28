import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

const LUCA = 'Luca Rossi';
const LUCA_API = '**/api/users/4';
const API = 'http://localhost:3000';

test.describe('Suspend user as admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });
  // These tests change data on the server: run them in order, in one worker.
  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ request }) => {
    await request.post(`${API}/__test/reset`);
  });

  test('suspends an active user', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await usersPage.suspendButton(LUCA).click();
    await expect(usersPage.suspendDialog).toContainText(`Suspend ${LUCA}?`);

    await usersPage.suspendConfirm.click();
    await expect(usersPage.suspendConfirm).toHaveText('Suspending…');

    await expect(usersPage.suspendDialog).toBeHidden();
    await expect(page.getByText(`${LUCA} was suspended.`)).toBeVisible();
    await expect(usersPage.statusOf(LUCA)).toHaveText('suspended');
    await expect(usersPage.suspendButton(LUCA)).toHaveCount(0);

    // Saved on the server, not just changed in the UI.
    await page.reload();
    await expect(usersPage.statusOf(LUCA)).toHaveText('suspended');
  });

  test('cancel closes the dialog and changes nothing', async ({ page }) => {
    const patches: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'PATCH') patches.push(request.url());
    });

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.suspendButton(LUCA).click();
    await usersPage.suspendCancel.click();

    await expect(usersPage.suspendDialog).toBeHidden();
    await expect(usersPage.statusOf(LUCA)).toHaveText('active');
    expect(patches).toHaveLength(0);
  });

  test('Escape closes the dialog and returns focus to the trigger', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.suspendButton(LUCA).click();
    await expect(usersPage.suspendDialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(usersPage.suspendDialog).toBeHidden();
    await expect(usersPage.suspendButton(LUCA)).toBeFocused();
  });

  test('shows the error in the dialog and recovers on retry', async ({ page }) => {
    let patchCalls = 0;
    await page.route(LUCA_API, (route) => {
      if (route.request().method() !== 'PATCH') return route.continue();
      patchCalls += 1;
      return patchCalls === 1
        ? route.fulfill({ status: 500, json: {} })
        : route.continue(); // the retry goes to the real API
    });

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.suspendButton(LUCA).click();
    await usersPage.suspendConfirm.click();

    await expect(usersPage.suspendError).toHaveText(
      'The user could not be suspended. Please try again.',
    );
    await expect(usersPage.suspendDialog).toBeVisible();
    await expect(usersPage.suspendConfirm).toBeEnabled();

    await usersPage.suspendConfirm.click();

    await expect(usersPage.suspendDialog).toBeHidden();
    await expect(usersPage.statusOf(LUCA)).toHaveText('suspended');
    expect(patchCalls).toBe(2);
  });

  test('explains when permission was removed mid-session', async ({ page }) => {
    await page.route(LUCA_API, (route) =>
      route.request().method() === 'PATCH'
        ? route.fulfill({ status: 403, json: { message: 'Forbidden' } })
        : route.continue(),
    );

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.suspendButton(LUCA).click();
    await usersPage.suspendConfirm.click();

    await expect(usersPage.suspendError).toHaveText(
      'You no longer have permission to suspend users.',
    );
    // A refused action is not a forbidden page: the list stays usable.
    await expect(usersPage.table).toBeVisible();
  });

  test('shows the server’s message when a business rule rejects the action', async ({ page }) => {
    await page.route(LUCA_API, (route) =>
      route.request().method() === 'PATCH'
        ? route.fulfill({ status: 409, json: { message: 'This user can’t be suspended right now.' } })
        : route.continue(),
    );

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.suspendButton(LUCA).click();
    await usersPage.suspendConfirm.click();

    await expect(usersPage.suspendError).toHaveText('This user can’t be suspended right now.');
    await expect(usersPage.suspendDialog).toBeVisible();
  });

  test('offers no suspend action for yourself or inactive users', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await expect(usersPage.rows.first()).toBeVisible();

    await expect(usersPage.suspendButton('Ana Admin')).toHaveCount(0); // yourself
    await expect(usersPage.suspendButton('Giulia Bianchi')).toHaveCount(0); // suspended
    await expect(usersPage.suspendButton('Stefan Petrović')).toHaveCount(0); // invited
  });
});

test.describe('Suspend user as manager', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' });

  test('has no suspend actions', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await expect(usersPage.rows.first()).toBeVisible();
    await expect(usersPage.suspendButtons).toHaveCount(0);
  });

  test('server rejects the request even if the UI were bypassed', async ({ request }) => {
    const response = await request.patch(`${API}/api/users/4`, {
      headers: { Authorization: 'Bearer 2' },
      data: { status: 'suspended' },
    });
    expect(response.status()).toBe(403);
  });
});
