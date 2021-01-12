import prisma from 'lib/prisma/prisma'
import { FriendRequests, FriendshipType, User } from '@prisma/client'
import {
	toFriendRequestReceived as toFriendRequestReceivedInner,
	toFriendRequestSent as toFriendRequestSentInner,
	YourFriend
} from './mapFriendsDbToClient'
import { ErrorInLibWithLogging, LibErrorType } from '../../logger/libLogger'

export enum GetFriendsErrorType {
	UserIdDoesntExist
}

export class GetFriendsError extends
	ErrorInLibWithLogging<GetFriendsErrorType>
{
	constructor(
		public getFriendsErrorType: GetFriendsErrorType,
		public mapMessage?: unknown,
		public parentError?: Error
	) {
		super(
			{
				libErrorType: LibErrorType.GetFriends,
				innerEnum: GetFriendsErrorType,
				innerErrorEnumValue: getFriendsErrorType,
				parentError,
				libErrorMessage: JSON.stringify(mapMessage)
			}
		)
	}
}

export function isGetFriendsError(err: Error):
	err is GetFriendsError
{
	return (
		err instanceof GetFriendsError ||
		(
			typeof err === 'object' && ('getFriendsErrorType' in err)
		)
	)
}

function toFriendRequestReceived(
	acceptedRequestReceived: FriendRequests & {requester: User}
): YourFriend {
	return toFriendRequestReceivedInner(
		acceptedRequestReceived,
		acceptedRequestReceived.requester
	)
}

function toFriendRequestSent(
	acceptedRequestSent: FriendRequests & {requestee: User}
): YourFriend {
	return toFriendRequestSentInner(
		acceptedRequestSent,
		acceptedRequestSent.requestee
	)
}

export async function getFriends(ofUserWithId: number):
	Promise<YourFriend[]>
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
					// We need to get whomever you sent the request to
					requestee: true
				}
			},
			friendRequestsReceived: {
				where: {
					friendshipType: FriendshipType.ACCEPTED,
				},
				include: {
					// We need to get whomever sent the request to you
					requester: true
				}
			}
		}
	})
	if(!user) {
		throw new GetFriendsError(
			GetFriendsErrorType.UserIdDoesntExist
		)
	}


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