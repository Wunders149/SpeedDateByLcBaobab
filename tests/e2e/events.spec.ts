import { test, expect } from '@playwright/test';

const demoEmail = 'emma@example.com';
const demoPassword = 'Password123!';

test.describe('Public events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(demoEmail);
    await page.getByLabel(/password/i).fill(demoPassword);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
  });

  test('lists upcoming events', async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
  });

  test('event details navigates', async ({ page }) => {
    await page.goto('/events');
    const firstCard = page.locator('a[href^="/events/"]').first();
    if (await firstCard.count()) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/events\/.+/);
    }
  });

  test('faq page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByText(/frequently asked/i)).toBeVisible();
  });
});
