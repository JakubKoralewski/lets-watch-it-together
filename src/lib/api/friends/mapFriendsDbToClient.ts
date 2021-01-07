import { FriendRequests, User } from '@prisma/client'
import { UserPublicSearchResult } from '../../UserPublic'
import { FriendshipTypeResponse } from '../user/[id]/FriendshipType'

export type Friend =
	Omit<UserPublicSearchResult, 'status'> & {
	status:
		FriendshipTypeResponse.AcceptedByYou |
		FriendshipTypeResponse.AcceptedByOther
}

export function toFriendRequestReceived(
	acceptedRequestReceived: FriendRequests & {requester: User}
): Friend {
	return {
		image: acceptedRequestReceived.requester.image,
		id: acceptedRequestReceived.requester.id,
		name: acceptedRequestReceived.requester.name,
		status: FriendshipTypeResponse.AcceptedByYou
	}
}

export function toFriendRequestSent(
	acceptedRequestSent: FriendRequests & {requestee: User}
): Friend {
	return {
		image: acceptedRequestSent.requestee.image,
		id: acceptedRequestSent.requestee.id,
		name: acceptedRequestSent.requestee.name,
		status: FriendshipTypeResponse.AcceptedByOther
	}
}