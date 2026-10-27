import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

const USERS_API = '**/api/users';

test.describe('Users list as admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('shows a loading state, then the users', async ({ page }) => {
    // Slow the real response down so the loading state is reliably visible.
    await page.route(USERS_API, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.loading).toBeVisible();
    await expect(usersPage.table).toBeVisible();
    await expect(usersPage.loading).toHaveCount(0);
    await expect(usersPage.rows).toHaveCount(6);
    await expect(usersPage.createButton).toBeVisible();
  });

  test('shows the empty state when there are no users', async ({ page }) => {
    await page.route(USERS_API, (route) => route.fulfill({ status: 200, json: [] }));

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.empty).toBeVisible();
    await expect(usersPage.table).toHaveCount(0);
  });

  test('shows an error and recovers on retry', async ({ page }) => {
    let calls = 0;
    await page.route(USERS_API, (route) => {
      calls += 1;
      return calls === 1
        ? route.fulfill({ status: 500, json: { message: 'Internal error' } })
        : route.continue(); // second call goes to the real API
    });

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.error).toBeVisible();
    await expect(usersPage.error).toContainText('We could not load users');

    await usersPage.retryButton.click();

    await expect(usersPage.rows).toHaveCount(6);
    await expect(usersPage.error).toHaveCount(0);
    expect(calls).toBe(2);
  });

  test('shows forbidden when the server refuses (stale permissions)', async ({ page }) => {
    // The frontend thinks admin can read users, but the server says no.
    await page.route(USERS_API, (route) =>
      route.fulfill({ status: 403, json: { message: 'Forbidden' } }),
    );

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.forbidden).toBeVisible();
    await expect(usersPage.retryButton).toHaveCount(0);
    await expect(usersPage.createButton).toHaveCount(0);
  });

  test('returns to login when the session expires mid-use', async ({ page }) => {
    await page.route(USERS_API, (route) =>
      route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
    );

    await new UsersPage(page).goto();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Users list as manager', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' });

  test('shows users read-only', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.rows).toHaveCount(6);
    await expect(usersPage.readOnlyNote).toBeVisible();
    await expect(usersPage.createButton).toHaveCount(0);
  });
});

test.describe('Users list as agent', () => {
  test.use({ storageState: 'e2e/.auth/agent.json' });

  test('shows forbidden without calling the API', async ({ page }) => {
    const usersRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/users')) usersRequests.push(request.url());
    });

    const usersPage = new UsersPage(page);
    await usersPage.goto();

    await expect(usersPage.forbidden).toBeVisible();
    expect(usersRequests).toHaveLength(0);
  });
});
