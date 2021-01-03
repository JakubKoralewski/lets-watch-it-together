import { getSession } from 'next-auth/client'
import prisma from 'lib/prisma/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { constants } from 'http2'
import { UserPublicSearchResult } from 'lib/UserPublic'
const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log('search users', req.query.q)
	if (session) {
		// Signed in
		const query = req.query.q
		if (
			typeof query !== 'string' ||
			query === '' ||
			query === ' ' ||
			query.length <= 2
		) {
			res.status(HTTP_STATUS_BAD_REQUEST)
			res.end()
			return
		}
		console.log('Session', JSON.stringify(session, null, 2))
		const users = await prisma.user.findMany({
			where: {
				name: { contains: query },
				AND: { id: { not: { equals: session.user['id'] } } },
			},
		})
		const result: UserPublicSearchResult[] = users.map((x) => ({
			id: x.id,
			name: x.name,
			image: x.image,
		}))
		console.log('result', result)
		res.json(result)
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
