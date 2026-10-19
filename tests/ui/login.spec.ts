import { test, expect } from '../../src/fixtures/testFixtures';

test('LOG-01: Login with valid credentials', async ({
  page,
  loginPage,
}) => {
  await page.goto('/');

  await loginPage.login(
     process.env.TEST_USERNAME!,
     process.env.TEST_PASSWORD!
   );

  await expect(
    page.getByRole('link', { name: 'Log out' }),
  ).toBeVisible();
});
