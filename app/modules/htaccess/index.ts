import { defineNuxtModule } from '@nuxt/kit';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export default defineNuxtModule({
	meta: { name: 'nuxt-static-htaccess' },
	setup(_, nuxt) {
		nuxt.hook('nitro:build:public-assets', () => {
			if (!process.env.NUXT_STATIC) return;

			const src = join(__dirname, '.htaccess');
			if (!existsSync(src)) return;

			const destDir = join(nuxt.options.rootDir, '.output/public');
			if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

			const dest = join(destDir, '.htaccess');
			copyFileSync(src, dest);

			console.info('[htaccess] .htaccess added to ', destDir);
		});
	},
});
