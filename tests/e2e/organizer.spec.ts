import { test, expect } from '@playwright/test';

const adminEmail = 'admin@speeddate.dev';
const adminPassword = 'Admin123!';

test.describe('Organizer dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
  });

  test('admin can open events list', async ({ page }) => {
    await page.goto('/admin/events');
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
  });

  test('admin can open participants list', async ({ page }) => {
    await page.goto('/admin/participants');
    await expect(page.getByRole('heading', { name: /participants/i })).toBeVisible();
  });

  test('admin can open matching workspace', async ({ page }) => {
    await page.goto('/admin/matching');
    await expect(page.getByRole('heading', { name: /matching/i })).toBeVisible();
  });

  test('admin can open audit log', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page.getByRole('heading', { name: /audit/i })).toBeVisible();
  });

  test('admin can open reports', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible();
  });
});
