import {
	FriendshipTypeResponse
} from './[id]/friend/FriendshipType'
import { FriendshipType, User, Prisma } from '@prisma/client'
import { mapUserToKnownFriend } from './UserDetails'
import { createLogger, LoggerTypes } from '../../logger'

type UserPublicSearchResultKeys = 'id' | 'name' | 'image'
export type UserPublicSearchResult = Pick<
	User,
	UserPublicSearchResultKeys> & { status: FriendshipTypeResponse }

export type UserWithFriendsData =
	Prisma.UserGetPayload<{
		include: {
			friendRequestsReceived: true,
			friendRequestsSent: true
		}
	}>

const logger = createLogger(LoggerTypes.Misc)

export function mapUserToUserPublicSearchResult(
	user: UserWithFriendsData
): UserPublicSearchResult {
	let status = FriendshipTypeResponse.NotFriends
	// const isFriend = await prisma.user.
	if (user.friendRequestsReceived.length === 1) {
		// you have sent the friend request
		// now check if accepted
		const friendRequest = user.friendRequestsReceived[0]
		switch (friendRequest.friendshipType) {
			case FriendshipType.ACCEPTED:
				status = FriendshipTypeResponse.AcceptedByOther
				break
			case FriendshipType.CANCELLED:
				status = FriendshipTypeResponse.CancelledByYou
				break
			case FriendshipType.DENIED:
			case FriendshipType.UNFRIENDED_BY_REQUESTEE:
			case FriendshipType.UNFRIENDED_BY_REQUESTER:
				status = FriendshipTypeResponse.NotFriends
				break
			case FriendshipType.REQUESTED:
				status = FriendshipTypeResponse.RequestedByYou
		}

	} else if (user.friendRequestsReceived.length > 1) {
		// fatal error database corrupted
		logger.error({user, message: 'db corrupt'})
	} else if (user.friendRequestsSent.length === 1) {
		// the user has sent you the friend request
		// now check if you have accepted
		const friendRequest = user.friendRequestsSent[0]
		switch (friendRequest.friendshipType) {
			case FriendshipType.ACCEPTED:
				status = FriendshipTypeResponse.AcceptedByYou
				break
			case FriendshipType.CANCELLED:
			case FriendshipType.DENIED:
			case FriendshipType.UNFRIENDED_BY_REQUESTEE:
			case FriendshipType.UNFRIENDED_BY_REQUESTER:
				status = FriendshipTypeResponse.NotFriends
				break
			case FriendshipType.REQUESTED:
				status = FriendshipTypeResponse.RequestedByOther
		}
	} else if (user.friendRequestsSent.length > 1) {
		// fatal error database corrupted
		logger.error({user, message: 'db corrupt'})
	}
	return {
		...mapUserToKnownFriend(user),
		status
	}
}