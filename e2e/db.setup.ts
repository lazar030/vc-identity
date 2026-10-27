import { test as setup, expect } from '@playwright/test';

setup('reset database to seed', async ({ request }) => {
  const response = await request.post('http://localhost:3000/__test/reset');
  expect(
    response.status(),
    'Reset endpoint missing: stop `npm run dev` so Playwright starts the API with E2E=true',
  ).toBe(204);
});
