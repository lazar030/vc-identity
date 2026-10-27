import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // tolerate tiny anti-aliasing noise
      animations: 'disabled',  // freezes the Material spinner and transitions
      caret: 'hide',           // blinking cursors cause random diffs
    },
  },

  projects: [
    // Logs in once per role and resets the DB; all other tests wait for it.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /.*\.visual\.spec\.ts/,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
      dependencies: ['setup'],
      testMatch: /.*\.visual\.spec\.ts/,
    },
  ],

  // Playwright starts both servers and waits until they respond.
  webServer: [
    {
      command: 'npm run api',
      url: 'http://localhost:3000/api/me', // 401 counts as "ready"
      reuseExistingServer: !process.env.CI,
      env: { E2E: 'true' },
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
