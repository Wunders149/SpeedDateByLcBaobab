import { test, expect } from '@playwright/test';

test.describe('Questionnaire', () => {
  test('requires auth for questionnaire page', async ({ page }) => {
    await page.goto('/questionnaire');
    await expect(page).toHaveURL(/login/);
  });

  test('questionnaire intro shows categories', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('emma@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
    await page.goto('/questionnaire/intro');
    await expect(page.getByText(/values|communication|personality/i).first()).toBeVisible();
  });
});
