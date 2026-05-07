import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const CI = process.env.CI;
const PALYWRIGHT_LOCAL = process.env.PALYWRIGHT_LOCAL;
const VERCEL_AUTOMATION_BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (CI) {
  if (!PALYWRIGHT_LOCAL && !VERCEL_AUTOMATION_BYPASS_SECRET) {
    throw new Error(
      'VERCEL_AUTOMATION_BYPASS_SECRET is required to run tests against protected deployments',
    );
  }
} else {
  dotenv.config({
    path: path.resolve(__dirname, '.env.local')
  });
}

const NEXTJS_ORIGIN = process.env.NEXT_PUBLIC_NEXTJS_ORIGIN;
const PLAYWRIGHT_TEST_DIR = process.env.PLAYWRIGHT_TEST_DIR;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const playwrightConfig = defineConfig({
  testDir: PLAYWRIGHT_TEST_DIR,
  testMatch: '**/*.spec.{ts,tsx}',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: NEXTJS_ORIGIN,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    extraHTTPHeaders: (CI && VERCEL_AUTOMATION_BYPASS_SECRET) ? {
      'x-vercel-protection-bypass': VERCEL_AUTOMATION_BYPASS_SECRET,
      // Use 'samesitenone' instead of 'true' when testing in an iframe.
      'x-vercel-set-bypass-cookie': 'true',
    } : undefined,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: []
});
export default playwrightConfig;