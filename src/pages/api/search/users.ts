import { getSession } from 'next-auth/client'
import prisma from 'lib/prisma/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { constants } from 'http2'
import { UserPublicSearchResult } from 'lib/UserPublic'
import { FriendshipTypeResponse } from 'lib/api/user/[id]/FriendshipType'
import { FriendshipType } from '@prisma/client'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED
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
			query.length <= 1
		) {
			res.status(HTTP_STATUS_BAD_REQUEST)
			res.end()
			return
		}
		console.log('Session', JSON.stringify(session, null, 2))
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
		console.log(JSON.stringify(users, undefined, 4))
		const result: UserPublicSearchResult[] = users.map((usr) => {
			let status = FriendshipTypeResponse.NotFriends
			// const isFriend = await prisma.user.
			if (usr.friendRequestsReceived.length === 1) {
				// you have sent the friend request
				// now check if accepted
				const friendRequest = usr.friendRequestsReceived[0]
				switch (friendRequest.friendshipType) {
					case FriendshipType.ACCEPTED:
						status = FriendshipTypeResponse.AcceptedByOther
						break;
					case FriendshipType.CANCELLED:
						status = FriendshipTypeResponse.CancelledByYou
						break;
					case FriendshipType.DENIED:
					case FriendshipType.UNFRIENDED_BY_REQUESTEE:
					case FriendshipType.UNFRIENDED_BY_REQUESTER:
						status = FriendshipTypeResponse.NotFriends
						break;
					case FriendshipType.REQUESTED:
						status = FriendshipTypeResponse.RequestedByYou
				}

			} else if (usr.friendRequestsReceived.length > 1) {
				// fatal error database corrupted
				console.error(JSON.stringify(usr))
			} else if (usr.friendRequestsSent.length === 1) {
				// the user has sent you the friend request
				// now check if you have accepted
				const friendRequest = usr.friendRequestsSent[0]
				switch (friendRequest.friendshipType) {
					case FriendshipType.ACCEPTED:
						status = FriendshipTypeResponse.AcceptedByYou
						break;
					case FriendshipType.CANCELLED:
					case FriendshipType.DENIED:
					case FriendshipType.UNFRIENDED_BY_REQUESTEE:
					case FriendshipType.UNFRIENDED_BY_REQUESTER:
						status = FriendshipTypeResponse.NotFriends
						break;
					case FriendshipType.REQUESTED:
						status = FriendshipTypeResponse.RequestedByOther
				}
			} else if (usr.friendRequestsSent.length > 1) {
				// fatal error database corrupted
				console.error(JSON.stringify(usr))
			}
			return {
				id: usr.id,
				name: usr.name,
				image: usr.image,
				status
			}
		})
		console.log({ result })
		res.json(result)
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
