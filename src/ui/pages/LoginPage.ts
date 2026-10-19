import { Page, Locator } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  // Locators
  get usernameInput(): Locator {
    return this.page.locator('#loginusername');
  }

  get passwordInput(): Locator {
    return this.page.locator('#loginpassword');
  }

  get loginButton(): Locator {
   return this.page.getByRole('button', { name: 'Log in', exact: true });
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: 'Log in' });
  }


  get loginDialog(): Locator {
    return this.page.locator('#logInModal');
  }

  async login(username: string, password: string): Promise<void> {
    // 1. Click the Log in hyperlink
    await this.loginLink.click();

    // 2. Wait for the login dialog to appear
   await this.loginDialog.waitFor({ state: 'visible' });;

    // 3. Fill in username and password
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    // 4. Click the Log in button
    await this.loginButton.click();
  }
}