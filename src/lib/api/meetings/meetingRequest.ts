import prisma from 'lib/prisma/prisma'
import { Meeting, FriendshipType, User } from '@prisma/client'
import { ErrorInLibWithLogging, LibErrorType } from '../../logger/libLogger'

export enum MeetingRequestErrorType {
	YourUserIdDoesntExist,
	FriendsUserIdDoesntExist,
	CantAddMeetingBetweenSamePeople,

}

export class MeetingRequestError extends
	ErrorInLibWithLogging<MeetingRequestErrorType>
{
	constructor(
		public meetingRequestErrorType: MeetingRequestErrorType,
		public mapMessage?: unknown,
		public parentError?: Error
	) {
		super(
			{
				libErrorType: LibErrorType.MeetingRequest,
				innerEnum: MeetingRequestErrorType,
				innerErrorEnumValue: meetingRequestErrorType,
				parentError,
				libErrorMessage: JSON.stringify(mapMessage)
			}
		)
	}
}

export function isMeetingRequestError(err: Error):
	err is MeetingRequestError
{
	return (
		err instanceof MeetingRequestError ||
		(
			typeof err === 'object' && ('meetingRequest' +
				'meetingRequestErrorType' in err)
		)
	)
}

export enum MeetingRequestActionType {
	CreateNewMeetingRequest,
	CancelMeetingRequest,
	DeclineMeetingRequest,
	AcceptMeetingRequest
}


export async function meetingRequest(
	yourId: User['id'],
	friendId: User['id']
):
	Promise<Meeting>
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
		throw new MeetingRequestError(
			MeetingRequestErrorType.UserIdDoesntExist
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