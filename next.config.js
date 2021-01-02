const withPWA = require('next-pwa')

module.exports = (_phase, {_defaultConfig}) => {
	return withPWA({
		env: process.env.HEROKU_APP_NAME ? {
			NEXTAUTH_URL: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
		} : undefined,
		pwa: {
			dest: 'public',
			disable: process.env.NODE_ENV === 'development'
		}
	})
}