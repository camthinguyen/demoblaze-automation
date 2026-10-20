import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://api.demoblaze.com/login';

test.describe('Demoblaze Login API', () => {
  test('API-LOGIN-01: Login with valid credentials', async ({ request }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    expect(username, 'TEST_USERNAME must be configured').toBeTruthy();
    expect(password, 'TEST_PASSWORD must be configured').toBeTruthy();

    const response = await request.post(LOGIN_URL, {
      data: {
        username,
        password,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.text();

    // Demoblaze returns a token message on successful login.
    expect(responseBody).toContain('Auth_token:');
  });
});
