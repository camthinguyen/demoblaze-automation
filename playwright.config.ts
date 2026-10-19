import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, 'test-data.env'),
});

console.log('Environment file loaded:', Boolean(process.env.TEST_USERNAME));

export default defineConfig({
  testDir: './tests',

  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never',
    }],
  ],

  use: {
    baseURL: 'https://www.demoblaze.com',
    headless: false,
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
      testMatch: '**/api/**/*.spec.ts',
    },
  ],
});
