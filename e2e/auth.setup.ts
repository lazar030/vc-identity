import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

export const ROLES = ['admin', 'manager', 'agent'] as const;

for (const role of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(`${role}@vc.test`);

    // Wait until the app has actually loaded the session.
    await expect(page.getByTestId('layout-current-user')).toBeVisible();

    // Saves cookies + localStorage (our token) to a file.
    await page.context().storageState({ path: `e2e/.auth/${role}.json` });
  });
}
