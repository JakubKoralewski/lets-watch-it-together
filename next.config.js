const withPWA = require('next-pwa')

module.exports = (_phase, {_defaultConfig}) => {
	return withPWA({
		pwa: {
			dest: 'public',
			disable: process.env.NODE_ENV === 'development'
		},
		reactStrictMode: true,
		future: {
			webpack5: true
		}
	})
}