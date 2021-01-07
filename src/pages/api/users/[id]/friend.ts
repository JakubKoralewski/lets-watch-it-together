import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { constants } from 'http2'
import {
	addFriend, AddFriendErrorType, isAddFriendError
} from 'lib/api/user/[id]/addFriend'
import HTTPMethod from 'lib/utils/HTTPMethod'
import assertUnreachable from 'lib/utils/assertUnreachable'

const {
	HTTP_STATUS_UNAUTHORIZED,
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	const session = await getSession({ req })
	console.log('friend user', req.query.id)
	if (session) {
		const userId: number = session.user['id']
		// Signed in
		const friendId: string = req.query.id as string
		const isCancel = Boolean(req.query['cancel'])
		try {
			await addFriend(
				userId,
				friendId,
				{
					isCancel,
					method: req.method as HTTPMethod
				}
			)
		} catch (e) {
			if (isAddFriendError(e)) {

				const setMessageAsErrorType =
					(message?: string) => res.json(
						{
							message,
							errType: e.errorType,
							// send length of enum error just in case the enum changed and
							// someone reported this error in some issue
							// idk if this is a good idea 🤷‍️
							l: Object.keys(AddFriendErrorType).length
						}
					)

				switch (e.errorType) {
					case AddFriendErrorType.BadFriendId:
					case AddFriendErrorType.FriendAndUserAreTheSameId:
					case AddFriendErrorType.FriendDoesntExist:
					case AddFriendErrorType.AcceptWasNotProvidedButFriendRequestAlreadyExists:
					case AddFriendErrorType.TriedToAcceptButThereWasNothingToAccept:
					case AddFriendErrorType.CantAcceptTwice:
					case AddFriendErrorType.CantCancelAFriendRequestThatYouNeverMade:
						res.status(HTTP_STATUS_BAD_REQUEST)
						setMessageAsErrorType()
						break
					case AddFriendErrorType.InvalidMethod:
						res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
						setMessageAsErrorType()
						break
					case AddFriendErrorType.DbCorrupt:
						res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
						setMessageAsErrorType('db corrupt')
						break
					default:
						// make sure we exhausted all possibilities
						assertUnreachable(e.errorType)
				}
			} else {
				// unknown error
				throw e
			}
		}
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
