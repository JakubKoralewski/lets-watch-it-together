import prisma from 'lib/prisma/prisma'
import { constants } from 'http2'
import {
	mapUserToUserPublicSearchResult, UserPublicSearchResult
} from 'lib/api/users/UserPublic'
import {
	protectedApiHandler
} from 'lib/api/utils/protectedApiHandler'

const {
	HTTP_STATUS_BAD_REQUEST,
} = constants

export default protectedApiHandler(async (req, res, session) => {
	// Signed in
	const query = req.query.q
	if (
		typeof query !== 'string' ||
		query === '' ||
		query === ' ' ||
		query.length <= 1
	) {
		res.status(HTTP_STATUS_BAD_REQUEST)
		res.end()
		return
	}
	const users = await prisma.user.findMany({
		where: {
			name: { contains: query, mode: 'insensitive' },
			AND: { id: { not: { equals: session.user['id'] } } }
		},
		include: {
			friendRequestsReceived: {
				select: {
					friendshipType: true,
					acceptedAt: true,
					cancelledAt: true,
					requestedAt: true
				},
				where: {
					requesterId: session.user['id']
				}
			},
			friendRequestsSent: {
				select: {
					friendshipType: true,
					acceptedAt: true,
					cancelledAt: true,
					requestedAt: true
				},
				where: {
					requesteeId: session.user['id']
				}
			}
		}
	})
	const result: UserPublicSearchResult[] = users.map(
		mapUserToUserPublicSearchResult
	)
	res.jsonWithLog(result)
	res.end()
})
