import { NextApiHandler } from 'next'
import NextAuth, { InitOptions } from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from 'lib/prisma/prisma'
import { createLogger, LoggerTypes } from '../../../lib/logger'
import { ErrorInLibWithLogging, LibErrorType } from '../../../lib/logger/libLogger'

const authHandler: NextApiHandler = (req, res) =>
	NextAuth(req, res, options)
export default authHandler

export enum NextAuthErrorType {
	NO_GITHUB_ID,
	NO_GITHUB_SECRET
}

export class NextAuthError extends
	ErrorInLibWithLogging<NextAuthErrorType>
{
	constructor(
		public nextAuthErrorType: NextAuthErrorType,
		public mapMessage?: string,
		public parentError?: Error
	) {
		super(
			{
				libErrorType: LibErrorType.NextAuth,
				innerEnum: NextAuthErrorType,
				innerErrorEnumValue: nextAuthErrorType,
				libErrorMessage: mapMessage,
				parentError
			}
		)
	}
}

const loggerWithoutCallsiteInfo = createLogger(
	LoggerTypes.NextAuth,
	false
)
const loggerWithCallsiteInfo = createLogger(
	LoggerTypes.NextAuth,
	true
)

if(!process.env.GITHUB_ID) {
	throw new NextAuthError(
		NextAuthErrorType.NO_GITHUB_ID
	)
}
if(!process.env.GITHUB_SECRET) {
	throw new NextAuthError(
		NextAuthErrorType.NO_GITHUB_SECRET
	)
}
if(!process.env.SECRET) {
	loggerWithCallsiteInfo.warn({
		msg: '"SECRET" environment variable should be set'
	})
}

const options: InitOptions = {
	providers: [
		Providers.GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			scope: 'user:email read:user'
		}),
	],
	callbacks: {
		session: async (session, user) => {
			(session.user as Record<string, unknown>)['id'] =
				(user as Record<string, unknown>)['id']
			return Promise.resolve(session)
		},
		/**
		 * @param  {string} url      URL provided as callback URL by the client
		 * @param  {string} baseUrl  Default base URL of site (can be used as fallback)
		 * @return {string}          URL the client will be redirect to
		 */
		redirect: async (url, baseUrl) => {
			const rv = url.startsWith(baseUrl)
				? Promise.resolve(url)
				: Promise.resolve(baseUrl + url)
			loggerWithoutCallsiteInfo.debug(
				{
					msg: 'redirect',
					url,
					baseUrl,
					rv
				}
			)
			return rv
		}
	},
	events: {
		signIn: async (message) => {
			/* on successful sign in */
			loggerWithoutCallsiteInfo.debug({
				msg: 'signIn',
				m: message
			})
		},
		signOut: async (message) => {
			loggerWithoutCallsiteInfo.debug({
				msg: 'signOut',
				m: message
			})
			/* on signout */
		},
		createUser: async (message) => {
			/* user created */
			loggerWithoutCallsiteInfo.debug({
				msg: 'createUser',
				m: message
			})
		},
		linkAccount: async (message) => {
			/* account linked to a user */
			loggerWithoutCallsiteInfo.debug({
				msg: 'linkAccount',
				m: message
			})
		},
		session: async (message) => {
			/* session is active */
			loggerWithoutCallsiteInfo.trace({
				msg: 'session',
				m: message
			})
		},
		error: async (message) => {
			/* error in authentication flow */
			loggerWithCallsiteInfo.error({
				msg: 'error',
				m: message
			})
		}
	},
	pages: {
		newUser: '/app/welcome',
	},
	adapter: Adapters.Prisma.Adapter({ prisma }),
	secret: process.env.SECRET,
}
