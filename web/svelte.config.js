import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'public',
			assets: 'public',
			fallback: null,
			precompress: false
		}),
		alias: {
			$lib: './src/lib'
		},
		prerender: { entries: ['*'] }
	}
};
