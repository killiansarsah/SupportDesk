import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should login as customer and access dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'customer@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h1')).toContainText('My Support Tickets');
    await expect(page.locator('text=Create Ticket')).toBeVisible();
  });

  test('should login as support agent and access dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'agent@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h1')).toContainText('Support Dashboard');
    await expect(page.locator('text=Assigned Tickets')).toBeVisible();
  });

  test('should login as administrator and access dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('text=User Management')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'customer@email.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});