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
    // expect(responseBody).toContain('Auth_token:');
  });

  // test('API-LOGIN-02: Login with incorrect password', async ({ request }) => {
  //   const username = process.env.TEST_USERNAME;

  //   expect(username, 'TEST_USERNAME must be configured').toBeTruthy();

  //   const response = await request.post(LOGIN_URL, {
  //     data: {
  //       username,
  //       password: 'WrongPassword123!',
  //     },
  //   });

  //   expect(response.status()).toBe(200);

  //   const responseBody = await response.text();

  //   // Demoblaze can return application errors in a HTTP 200 response.
  //   expect(responseBody).toContain('Wrong password.');
  // });

  // test('API-LOGIN-03: Login with missing username', async ({ request }) => {
  //   const response = await request.post(LOGIN_URL, {
  //     data: {
  //       password: 'SomePassword123!',
  //     },
  //   });

  //   expect(response.status()).toBe(200);

  //   const responseBody = await response.text();
  //   expect(responseBody).toBeTruthy();
  // });

  // test('API-LOGIN-04: Login with missing password', async ({ request }) => {
  //   const username = process.env.TEST_USERNAME;

  //   expect(username, 'TEST_USERNAME must be configured').toBeTruthy();

  //   const response = await request.post(LOGIN_URL, {
  //     data: { username },
  //   });

  //   expect(response.status()).toBe(200);

  //   const responseBody = await response.text();
  //   expect(responseBody).toBeTruthy();
  // });
});
