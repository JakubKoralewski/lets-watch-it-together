const withPWA = require('next-pwa')

module.exports = (_phase, {_defaultConfig}) => {
	let env = undefined;
	if(process.env.HEROKU_APP_NAME) {
		env = {
			NEXTAUTH_URL: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
		}
		console.log('setting NEXTAUTH_URL to ', env.NEXTAUTH_URL)
	} else {
		console.log("HEROKU_APP_NAME env var doesn't exist")
	}
	return withPWA({
		env,
		pwa: {
			dest: 'public',
			disable: process.env.NODE_ENV === 'development'
		}
	})
}