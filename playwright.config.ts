import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, 'test-data.env'),
});

console.log('Environment file loaded:', Boolean(process.env.TEST_USERNAME));

export default defineConfig({
  testDir: './tests',

  // Enable parallel execution of tests within a file
  fullyParallel: true,

  // Run up to 4 workers in parallel
  workers: 4,

  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never',
    }],
  ],

  timeout: 30000, // Maximum duration for each test: 30 seconds

  expect: {
    timeout: 15000, // Default timeout for assertions: 15 seconds
  },

  use: {
    baseURL: 'https://www.demoblaze.com',
    headless: !!process.env.CI || false,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
  {
    name: 'chromium',
    testMatch: '**/ui/**/*.spec.ts',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    testMatch: '**/ui/**/*.spec.ts',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    testMatch: '**/ui/**/*.spec.ts',
    use: { ...devices['Desktop Safari'] },
  },
  {
  name: 'api',
  testDir: './tests/api',
  testMatch: '**/*.spec.ts'
  },
],
});
