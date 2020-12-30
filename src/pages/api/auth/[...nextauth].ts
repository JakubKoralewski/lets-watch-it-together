import { NextApiHandler } from 'next'
import NextAuth, {InitOptions} from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from 'prisma/prisma'

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
	session: {
		jwt: true
	},
	pages: {
		newUser: 'app/first-time',
	},
	adapter: Adapters.Prisma.Adapter({ prisma }),
	secret: process.env.SECRET,
}
