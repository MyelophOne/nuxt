import { test, expect } from '@playwright/test';
import { waitForNuxtApp } from './utils';

test('MyelophoneWelcome is rendered', async ({ page }) => {
	await waitForNuxtApp(page, 'http://localhost:3000');

	const body = page.locator('body');
	await expect(body).toContainText('MyelophOne Nuxt', { timeout: 5000 });
});
