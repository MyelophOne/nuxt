import { test, expect } from '@playwright/test'
import { waitForNuxtApp } from './utils'

test('the system font stack survives CSS processing', async ({ page }) => {
	await waitForNuxtApp(page, 'http://localhost:3000')

	const fonts = await page.evaluate(() => {
		const style = getComputedStyle(document.documentElement)
		return {
			stack: style.getPropertyValue('--font-sans'),
			family: style.fontFamily
		}
	})
	const expected = [
		'-apple-system',
		'system-ui',
		'BlinkMacSystemFont',
		'Segoe UI',
		'Roboto',
		'Oxygen',
		'Ubuntu',
		'Helvetica Neue',
		'Arial',
		'sans-serif',
		'color-emoji'
	]
	for (const value of [fonts.stack, fonts.family]) {
		expect(value.split(',').map((font) => font.trim().replace(/["']/g, ''))).toEqual(expected)
	}
})
