import type { Page } from '@playwright/test';

export async function waitForNuxtApp(
	page: Page,
	url: string,
	selector = '#__nuxt',
	attempts = 15,
	delayMs = 3000,
) {
	for (let i = 1; i <= attempts; i++) {
		try {
			await page.goto(url, { waitUntil: 'domcontentloaded' });
			const visible = await page.locator(selector).evaluate((el) => {
				const rect = el.getBoundingClientRect();
				return rect.width > 0 && rect.height > 0;
			});
			if (visible) return;
		} catch {}
		console.log(`Attempt ${i}/${attempts} failed, waiting ${delayMs}ms...`);
		await page.waitForTimeout(delayMs);
	}
	throw new Error(`Nuxt ${url} is not ready after ${attempts} attempts`);
}
