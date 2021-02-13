import { FriendRequests, User } from '@prisma/client'
import { UserPublicSearchResult } from '../users/UserPublic'
import { FriendshipTypeResponse } from '../users/[id]/friend/FriendshipType'

export type YourFriend =
	Omit<UserPublicSearchResult, 'status'> & {
	status:
		FriendshipTypeResponse.AcceptedByYou |
		FriendshipTypeResponse.AcceptedByOther
}

export function toFriendRequestReceived(
	acceptedRequestReceived: FriendRequests,
	requester: User
): YourFriend {
	return {
		image: requester.image,
		id: requester.id,
		name: requester.name,
		status: FriendshipTypeResponse.AcceptedByYou
	}
}

export function toFriendRequestSent(
	acceptedRequestSent: FriendRequests,
	requestee: User
): YourFriend {
	return {
		image: requestee.image,
		id: requestee.id,
		name: requestee.name,
		status: FriendshipTypeResponse.AcceptedByOther
	}
}
