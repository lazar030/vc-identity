import { test, expect } from '@playwright/test';

test.describe('as admin', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('sees the users link and can create users', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByTestId('layout-nav-users-link')).toBeVisible();
    await expect(page.getByTestId('identity-users-create-button')).toBeVisible();
    await expect(page.getByTestId('identity-users-readonly-note')).toHaveCount(0);
  });

  test('keeps the session after a reload', async ({ page }) => {
    await page.goto('/users');
    await page.reload();
    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByTestId('layout-current-user')).toContainText('Ana Admin');
  });
});

test.describe('as manager', () => {
  test.use({ storageState: 'e2e/.auth/manager.json' });

  test('sees users read-only', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByTestId('layout-nav-users-link')).toBeVisible();
    await expect(page.getByTestId('identity-users-readonly-note')).toBeVisible();
    await expect(page.getByTestId('identity-users-create-button')).toHaveCount(0);
  });
});

test.describe('as agent', () => {
  test.use({ storageState: 'e2e/.auth/agent.json' });

  test('does not see the users link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('layout-current-user')).toBeVisible();
    await expect(page.getByTestId('layout-nav-users-link')).toHaveCount(0);
  });
});

test('logout returns to login and clears the session', async ({ browser }) => {
  const context = await browser.newContext({ storageState: 'e2e/.auth/admin.json' });
  const page = await context.newPage();

  await page.goto('/users');
  await page.getByTestId('layout-logout-button').click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/users');
  await expect(page).toHaveURL(/\/login$/);
  await context.close();
});
