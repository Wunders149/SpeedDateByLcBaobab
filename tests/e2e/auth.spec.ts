import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SpeedDate/i);
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('user can navigate to login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/sign in|log in/i)).toBeVisible();
  });

  test('user can register a new participant', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByLabel(/age/i).fill('25');
    await page.getByRole('button', { name: /register|sign up/i }).click();
    await expect(page).toHaveURL(/dashboard|login/, { timeout: 15_000 });
  });

  test('protected route redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
