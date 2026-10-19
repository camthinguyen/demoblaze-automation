import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../ui/pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };