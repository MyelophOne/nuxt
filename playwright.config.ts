import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	timeout: 300_000,
	retries: 2,
	workers: 4,
	reporter: [['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:3000',
		browserName: 'chromium',
		headless: true,
		viewport: { width: 1536, height: 864 },
		trace: 'on',
	},
	webServer: {
		command: 'yarn build && yarn server',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 240 * 1000,
	},
});
