import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './test',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: 0,

  /* Opt out of parallel tests on CI */
  workers: 1,

  /* Test timeout */
  timeout: 60000,

  /* Shared settings for all the projects below */
  expect: {
    timeout: 60000,
  },

  use: {
      headless: false,
    actionTimeout: 60000,
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },

  reporter: [
    ['list'],
    ['allure-playwright'],
  ],

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to run other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
