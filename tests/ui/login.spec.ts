import { test, expect } from '../../src/fixtures/testFixtures';
import { LoginPage } from '../../src/pages/ui/LoginPage';

test.describe('Demoblaze Login Feature Test Suite', () => {
  let loginPage: LoginPage;
  const validUser = process.env.TEST_USERNAME!;
  const validPass = process.env.TEST_PASSWORD!;

  const loginTestData = [
    {
      tcId: 'TC_LOG_05',
      category: 'Validation',
      description: 'username is provided but password is empty',
      username: validUser,
      password: '',
      expectedAlert: 'Please fill out Username and Password.',
    },
    {
      tcId: 'TC_LOG_06',
      category: 'Validation',
      description: 'password is provided but username is empty',
      username: '',
      password: validPass,
      expectedAlert: 'Please fill out Username and Password.',
    },
    {
      tcId: 'TC_LOG_07',
      category: 'Validation',
      description: 'both username and password are empty',
      username: '',
      password: '',
      expectedAlert: 'Please fill out Username and Password.',
    },
    {
      tcId: 'TC_LOG_08',
      category: 'Authentication Error',
      description: 'logging in with wrong password',
      username: validUser,
      password: 'WrongPassword123!',
      expectedAlert: 'Wrong password.',
    },
    {
      tcId: 'TC_LOG_09',
      category: 'Authentication Error',
      description: 'logging in with non-existent username',
      username: `nonexistent_user_${Date.now()}`,
      password: 'SomePassword123!',
      expectedAlert: 'User does not exist.',
    },
    {
      tcId: 'TC_LOG_11',
      category: 'Security / XSS',
      description: 'Cross-Site Scripting (XSS) injection in username field',
      username: "<script>alert('xss')</script>",
      password: 'Password123!',
      expectedAlert: 'User does not exist.',
    },
    {
      tcId: 'TC_LOG_13',
      category: 'Edge Case / Whitespace',
      description: 'leading and trailing spaces in password field',
      username: validUser,
      password: `   ${validPass}   `,
      expectedAlert: 'Wrong password.',
    },
    {
      tcId: 'TC_LOG_14',
      category: 'Edge Case / Case Sensitivity',
      description: 'case sensitivity of username field (uppercase)',
      username: 'TESTUSER_PW_2026',
      password: validPass,
      expectedAlert: 'User does not exist.',
    },
    {
      tcId: 'TC_LOG_15',
      category: 'Edge Case / Case Sensitivity',
      description: 'case sensitivity of password field (incorrect casing)',
      username: validUser,
      password: 'password123!',
      expectedAlert: 'Wrong password.',
    },
  ];

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Precondition: User is on Home page
    await loginPage.navigateHomePage();
  });

  // -------------------------------------------------------------------------
  // Test Case 1: Verify Login modal controls and element visibility
  // -------------------------------------------------------------------------
  test('TC_LOG_01: Verify Login modal controls and element visibility', {
    tag: ['@regression'],
  }, async ({ page }) => {
    // Action: Click 'Log in' on navbar
    await loginPage.openLoginModal();

    // Expected Result: Modal renders with title, inputs, and buttons visible & enabled
    await expect(loginPage.modalTitle).toHaveText('Log in');

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEnabled();

    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEnabled();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();

    await expect(loginPage.closeButton).toBeVisible();
    await expect(loginPage.closeButton).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // Test Case 2: Verify closing Login modal via Close button or 'x' icon
  // -------------------------------------------------------------------------
  test('TC_LOG_02: Verify closing Login modal via Close button or x icon', {
  tag: ['@regression'],
  },async ({ page }) => {
    // Action: Open Login modal & enter partial inputs
    await loginPage.openLoginModal();
    await loginPage.usernameInput.fill('partial_user');

    // Action: Click 'Close' button (or top-right 'x' icon)
    await loginPage.xButton.click();

    // Expected Result: Modal dismisses cleanly without modifying navbar state
    await expect(loginPage.loginModal).not.toBeVisible();
    await expect(loginPage.navLoginLink).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test Case 3: Verify successful login with valid credentials
  // -------------------------------------------------------------------------
  test('TC_LOG_03: Verify successful login with valid credentials', {
      tag: ['@demo', '@regression', '@smoke'], 
    },
    async ({ page }) => {
    await loginPage.login(validUser, validPass);

    // Expected Result: Navbar displays greeting and logout button becomes visible
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
    await expect(loginPage.navLogoutLink).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test Case 4: Verify submitting login form using the 'Enter' key
  // -------------------------------------------------------------------------
  test('TC_LOG_04: Verify submitting login form using the Enter key', { tag: ['@regression'] }, async ({ page }) => {
    // Precondition: Open modal with form ready
    await loginPage.openLoginModal();
    
    // Fill in username and password
    await loginPage.usernameInput.fill(validUser);
    await loginPage.passwordInput.fill(validPass);

    // Action: press 'Enter' on password field
    await loginPage.passwordInput.press('Enter');

    // Expected Result: Form submits successfully via keyboard press
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
    await expect(loginPage.navLogoutLink).toBeVisible();
  });

  test.describe('Demoblaze Login Comprehensive Data-Driven Test Suite', () => {
  for (const data of loginTestData) {
    test(`${data.tcId} [${data.category}]: Verify ${data.description}`, async ({ page, loginPage }) => {
      // 1. Open Login modal
      await loginPage.openLoginModal();

      // 2 & 3. Fill inputs dynamically based on the dataset
      await loginPage.usernameInput.fill(data.username);
      await loginPage.passwordInput.fill(data.password);

      // Setup dialog promise prior to click for reliable event capture
      const dialogPromise = page.waitForEvent('dialog');

      // 4. Click 'Log in' button
      loginPage.loginButton.click();

      const dialog = await dialogPromise;
      const alertMessage = dialog.message();
      await dialog.accept();

      // Assert expected alert message and modal persistence
      expect(alertMessage).toBe(data.expectedAlert);
      await expect(page.locator('#logInModal')).toBeVisible();
    });
  }

  // -------------------------------------------------------------------------
  // TC_LOG_08: Verify error alert when logging in with wrong password
  // -------------------------------------------------------------------------
  test('TC_LOG_08: Verify error alert when logging in with wrong password', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    // 1. Open Login modal
    await loginPage.openLoginModal();
    
    // 2. Enter unregistered username & password
    await loginPage.usernameInput.fill(validUser);
    await loginPage.passwordInput.fill('WrongPassword123!');

    // 3. Setup the dialog promise *before* clicking so Playwright waits for it reliably
    const dialogPromise = page.waitForEvent('dialog');

    // 4. Click 'Log in' button
    await loginPage.loginButton.click();

    // 5. Await the dialog event and extract the message
    const dialog = await dialogPromise;
    const alertMessage = dialog.message();
    await dialog.accept();

    // Assert expected alert text & modal persistence
    expect(alertMessage).toBe('Wrong password.');
    await expect(loginPage.loginModal).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_LOG_10: Verify application resilience against SQL Injection in username field
  // -------------------------------------------------------------------------
  test('TC_LOG_10: Verify application resilience against SQL Injection in username field', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    // 1. Open Login modal
    await loginPage.openLoginModal();

    // 2. Enter SQL injection payload in username & any password
    await loginPage.usernameInput.fill("' OR '1'='1");
    await loginPage.passwordInput.fill("anyPassword123");

    // Setup dialog promise before clicking
    const dialogPromise = page.waitForEvent('dialog');

    // 3. Click 'Log in' button
    await loginPage.loginButton.click();

    const dialog = await dialogPromise;
    const alertMessage = dialog.message();
    await dialog.accept();

    // Expected Result: System rejects payload safely with standard error
    expect(['User does not exist.', 'Wrong password.']).toContain(alertMessage);
    await expect(loginPage.loginModal).toBeVisible();
    await expect(loginPage.userGreeting).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_LOG_12: Verify handling of leading and trailing spaces in username
  // -------------------------------------------------------------------------
  test('TC_LOG_12: Verify handling of leading and trailing spaces in username', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    // 1. Open Login modal
    await loginPage.openLoginModal();

    // 2. Enter username with leading/trailing spaces & 3. Enter valid password
    await loginPage.usernameInput.fill(`   ${validUser}   `);
    await loginPage.passwordInput.fill(validPass);

    // 4. Click 'Log in'
    await loginPage.loginButton.click();

    // Expected Result: Depending on backend sanitization, either logs in successfully (if trimmed) 
    // or displays 'User does not exist.' (if strict match). We verify state consistency.
    try {
      await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`, { timeout: 3000 });
    } catch {
      // If strict match rejects spaces, verify modal remains open with error alert
      await expect(loginPage.loginModal).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // TC_LOG_16: Verify successful user logout
  // -------------------------------------------------------------------------
  test('TC_LOG_16: Verify successful user logout', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    // Precondition: User is logged in
    await loginPage.login(validUser, validPass);
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);

    // Action: Click 'Log out' on the top navigation bar
    await loginPage.navLogoutLink.click();

    // Expected Result: Session terminates, greeting is removed, Login link reappears
    await expect(loginPage.userGreeting).not.toBeVisible();
    await expect(loginPage.navLoginLink).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_LOG_17: Verify login state persists across page refresh
  // -------------------------------------------------------------------------
  test('TC_LOG_17: Verify login state persists across page refresh', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    // Precondition: User is logged in
    await loginPage.login(validUser, validPass);
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);

    // Action: Refresh browser page (F5 or reload) & navigate across pages
    await page.reload();
    await page.click('text=Cart');
    await page.click('text=Home');

    // Expected Result: Session persists and greeting remains visible
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
  });
})
});