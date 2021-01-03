import { NextApiHandler } from 'next'
import NextAuth, { InitOptions } from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from 'lib/prisma/prisma'

const authHandler: NextApiHandler = (req, res) =>
	NextAuth(req, res, options)

export default authHandler

const options: InitOptions = {
	providers: [
		Providers.GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	callbacks: {
		session: async (session, user) => {
			session.user['id'] = user['id']
			return Promise.resolve(session)
		},
		/*
		jwt(
			token: GenericObject,
			user: User,
			account: GenericObject,
			profile: GenericObject,
			isNewUser: boolean
		): Promise<GenericObject> {
			console.log('jwt callback', token, user, account, profile, isNewUser)
			return Promise.resolve(token)
		},
*/
		/**
		 * @param  {string} url      URL provided as callback URL by the client
		 * @param  {string} baseUrl  Default base URL of site (can be used as fallback)
		 * @return {string}          URL the client will be redirect to
		 */
		redirect: async (url, baseUrl) => {
			const rv = url.startsWith(baseUrl)
				? Promise.resolve(url)
				: Promise.resolve(baseUrl + url)
			console.log('redirect', url, baseUrl, rv)
			return rv
		}
	},
	// session: {
	// 	jwt: true,
	// },
	pages: {
		newUser: '/app/welcome',
	},
	adapter: Adapters.Prisma.Adapter({ prisma }),
	secret: process.env.SECRET,
}
