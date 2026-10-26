import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login', () => {
  test('redirects an unauthenticated user to login', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submit.click();

    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });

  test('shows an error and stays on login with a wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@vc.test', 'wrong-password');

    await expect(loginPage.error).toHaveText('Invalid email or password.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows a generic error when the server fails', async ({ page }) => {
    // Mock exists ONLY in this test. The app code never knows about it.
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 500, json: { message: 'Internal error' } }),
    );

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@vc.test');

    await expect(loginPage.error).toHaveText('Something went wrong. Please try again.');
  });

  test('disables the submit button while signing in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.email.fill('admin@vc.test');
    await loginPage.password.fill('password');

    // The API has a 400ms delay, so the in-progress state is observable.
    await loginPage.submit.click();
    await expect(loginPage.submit).toBeDisabled();
    await expect(loginPage.submit).toHaveText('Signing in…');
  });

  test('sends the user back to login when the token is invalid', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('vc.token', '999'));
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login$/);
  });
});
