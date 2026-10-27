import { test, expect, Page } from '@playwright/test';
import { USERS, USER_WITH_LONG_CONTENT } from '../../src/app/features/identity/testing/user.fixtures';

const USERS_API = '**/api/users';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} as const;

/** Wait for web fonts so text renders identically every time. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
}

for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`users page (admin) – ${viewportName}`, () => {
    test.use({ storageState: 'e2e/.auth/admin.json', viewport });

    test('loaded', async ({ page }) => {
      // Figma: Users / List – Loaded
      await page.route(USERS_API, (route) =>
        route.fulfill({ json: [...USERS, USER_WITH_LONG_CONTENT] }),
      );
      await page.goto('/users');
      await expect(page.getByTestId('identity-users-table')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`users-loaded-${viewportName}.png`, { fullPage: true });
    });

    test('loading', async ({ page }) => {
      // Figma: Users / List – Loading
      await page.route(USERS_API, () => {
        /* never respond: the page stays in the loading state */
      });
      await page.goto('/users');
      await expect(page.getByTestId('identity-users-loading')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`users-loading-${viewportName}.png`);
    });

    test('empty', async ({ page }) => {
      // Figma: Users / List – Empty
      await page.route(USERS_API, (route) => route.fulfill({ json: [] }));
      await page.goto('/users');
      await expect(page.getByTestId('identity-users-empty')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`users-empty-${viewportName}.png`);
    });

    test('error', async ({ page }) => {
      // Figma: Users / List – Error
      await page.route(USERS_API, (route) => route.fulfill({ status: 500, json: {} }));
      await page.goto('/users');
      await expect(page.getByTestId('identity-users-error')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`users-error-${viewportName}.png`);
    });
  });
}

test.describe('users page (manager)', () => {
  test.use({ storageState: 'e2e/.auth/manager.json', viewport: VIEWPORTS.desktop });

  test('read-only', async ({ page }) => {
    // Figma: Users / List – Read-only
    await page.route(USERS_API, (route) => route.fulfill({ json: USERS }));
    await page.goto('/users');
    await expect(page.getByTestId('identity-users-readonly-note')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('users-readonly-desktop.png', { fullPage: true });
  });
});

test.describe('users page (agent)', () => {
  test.use({ storageState: 'e2e/.auth/agent.json', viewport: VIEWPORTS.desktop });

  test('forbidden', async ({ page }) => {
    // Figma: Users / List – Forbidden
    await page.goto('/users');
    await expect(page.getByTestId('identity-users-forbidden')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('users-forbidden-desktop.png');
  });
});
