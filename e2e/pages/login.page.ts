import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly root: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId('auth-login-page');
    this.email = page.getByTestId('auth-login-email-input');
    this.password = page.getByTestId('auth-login-password-input');
    this.submit = page.getByTestId('auth-login-submit-button');
    this.error = page.getByTestId('auth-login-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password = 'password'): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
