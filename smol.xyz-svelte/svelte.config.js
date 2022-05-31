import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-cloudflare-workers'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter(),
	}
};

export default config;