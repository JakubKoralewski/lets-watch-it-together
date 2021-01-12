import { mapUserToUserPublicSearchResult, UserPublicSearchResult, UserWithFriendsData } from './UserPublic'
import { User, Meeting, Prisma, FriendRequests } from '@prisma/client'
import { MeetingFriendResult } from '../meetings/MeetingFriendResult'
import {
	YourFriend,
	toFriendRequestReceived as toFriendRequestReceivedInner, toFriendRequestSent,
	toFriendRequestSent as toFriendRequestSentInner
} from '../friends/mapFriendsDbToClient'
import { FriendshipTypeResponse } from './[id]/FriendshipType'

/*
export type UserDetails = UserPublicSearchResult & {
	friends: User['id'][],
	meetings: Meeting['id'][]
}
*/

/**
 *  We omit status because we know they're a friend already
 *  from context.
 */
export type Friend = Omit<UserPublicSearchResult, 'status'>
export type UserDetails = UserPublicSearchResult & {
	friends: Friend[],
	meetings: MeetingFriendResult[],
	// liked:
	/** iso date */
	registeredAt: string,
	/** iso date */
	friendsAt: string
}

export function mapUserToKnownFriend(user: User): Friend {
	return {
		id: user.id,
		name: user.name,
		image: user.image,
	}
}
// export function areFriends(user: UserPublicSearchResult) {
// 	return user.status === FriendshipTypeResponse.AcceptedByOther ||
// 		user.status === FriendshipTypeResponse.AcceptedByYou
// }

/*
export type UserWithFriendsAndMeetings =
	Prisma.UserGetPayload<{
		include: {
			friendRequestsReceived: true,
			friendRequestsSent: true,
			meetingsReceived: true,
			meetingsCreated: true
		}
	}>
*/

/*
function fromFriendRequestsReceived(
	friendRequestReceived: FriendRequests
): YourFriend {
	return toFriendRequestReceivedInner(
		friendRequestReceived,
	)
}
function fromFriendRequestsSent(
	friendRequestSent: FriendRequests
): YourFriend {

}

export function mapUserToFriends(
	user: UserWithFriendsData
): YourFriend[] {
	return user.friendRequestsReceived
		.map(fromFriendRequestsReceived)
		.concat(
			user.friendRequestsSent
				.map(fromFriendRequestsSent)
}


export function mapUserToUserDetails(
	user: UserWithFriendsAndMeetings
): UserDetails {
	const userWithFriendStatus = mapUserToUserPublicSearchResult(user)
	return {
		...userWithFriendStatus,
		friends: user.friendRequestsSent.
	}

}*/
