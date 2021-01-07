import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { constants } from 'http2'
import { getFriends } from '../../../lib/api/friends/getFriends'
import { Friend } from '../../../lib/api/friends/mapFriendsDbToClient'

const {
	HTTP_STATUS_UNAUTHORIZED,
	HTTP2_METHOD_GET,
	HTTP_STATUS_METHOD_NOT_ALLOWED,
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log('/api/friends with method', req.method)
	if (session) {
		const userId: number = session.user['id']

		switch (req.method) {
			case HTTP2_METHOD_GET: {
				const friends: Friend[] = await getFriends(userId)
				console.log({friends})
				res.json(friends)
				res.end()
				return
			}
			default: {
				console.error('unsupported method', req.method)
				res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
				res.end()
				return
			}
		}
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
