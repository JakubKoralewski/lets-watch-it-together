import prisma from 'lib/prisma/prisma'
import {FriendshipType} from '@prisma/client'
import {
	Friend, toFriendRequestReceived, toFriendRequestSent
} from './mapFriendsDbToClient'

export async function getFriends(ofUserWithId: number):
	Promise<Friend[]>
{
	const user = await prisma.user.findUnique({
		where: {
			id: ofUserWithId
		},
		select: {
			friendRequestsSent: {
				where: {
					friendshipType: FriendshipType.ACCEPTED
				},
				include: {
					requestee: true
				}
			},
			friendRequestsReceived: {
				where: {
					friendshipType: FriendshipType.ACCEPTED,
				},
				include: {
					requester: true
				}
			}
		}
	})

	if(
		user.friendRequestsReceived.length === 0 &&
		user.friendRequestsSent.length === 0
	) {
		// no friends :(
		return []
	}
	return user
		.friendRequestsReceived
		.map(toFriendRequestReceived)
		.concat(
			user.friendRequestsSent
				.map(toFriendRequestSent)
		)
}