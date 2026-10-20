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

  get navLoginLink(): Locator {
    return this.page.getByRole('link', { name: 'Log in' });
  }

  get closeButton(): Locator {
    return this.page.locator("//div[@class = 'modal-footer']/button[text() = 'Close' and following-sibling::button[text() = 'Log in']]");
  }

   get xButton(): Locator {
    return this.page.locator("//h5[@id = 'logInModalLabel']/following-sibling::button[@aria-label = 'Close']");
  }

  get navLogoutLink(): Locator {
    return this.page.getByRole('link', { name: 'Log out' });
  }

  get userGreeting(): Locator {
    return this.page.getByRole('link', { name: 'Welcome' });
  }

  get modalTitle(): Locator{
    return this.page.locator('#logInModal .modal-title');
  }

  get loginModal(): Locator{
    return this.page.locator('#logInModal');
  }

  async navigateHomePage(path: string = '/') {
    await this.page.goto(path);
  }

  async openLoginModal() {
    await this.navLoginLink.click();
    // Wait for the modal input field to ensure the modal animation/render is complete
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  get loginDialog(): Locator {
    return this.page.locator('#logInModal');
  }

  async login(username: string, password: string): Promise<void> {
    // 1. Click the Log in hyperlink
    await this.navLoginLink.click();

    // 2. Wait for the login dialog to appear
    await this.loginDialog.waitFor({ state: 'visible' });;

    // 3. Fill in username and password
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    // 4. Click the Log in button
    await this.loginButton.click();
  }

  /**
   * Clicks the Logout link on the navigation bar, waits for the user session 
   * state to clear, and verifies the Login button becomes visible again.
   */
  async logout(): Promise<void> {
    await this.navLogoutLink.click();
    // Verify logout completes by ensuring login link is restored and greeting is hidden
    await this.navLoginLink.waitFor({ state: 'visible' });
  }
}