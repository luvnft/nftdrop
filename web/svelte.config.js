import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'public',
			assets: 'public',
			fallback: null, // 'index.html',
			precompress: false
			//strict: true,
		}),
		alias: {
			$lib: './src/lib'
		}
	} /* ,
	prerender: {
		default: true
	} */
};
