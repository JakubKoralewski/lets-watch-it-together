import { constants } from 'http2'
import {
	AddFriendActionType,
	AddFriendErrorType,
	friendRequest,
	isAddFriendError
} from 'lib/api/users/[id]/friendRequest'
import HTTPMethod from 'lib/utils/HTTPMethod'
import assertUnreachable from 'lib/utils/assertUnreachable'
import { protectedApiHandler } from '../../../../lib/api/utils/protectedApiHandler'
import { getIdAsNumber, setMessageAsErrorTypeGenerator } from '../../../../lib/api/utils/validation'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default protectedApiHandler(async (
	req,
	res,
	session
): Promise<void> => {
	const userId = session.user.id

	const { id: friendId, error } = getIdAsNumber(req, res)
	if (error) {
		return
	}

	let action: AddFriendActionType
	let isCancel = false
	switch (req.method) {
		case HTTPMethod.POST:
			action = AddFriendActionType.SendFriendRequest
			break
		case HTTPMethod.PATCH:
			action = AddFriendActionType.AcceptFriendRequest
			break
		case HTTPMethod.DELETE: {
			isCancel = Boolean(req.query['cancel'])
			if(isCancel) {
				action = AddFriendActionType.CancelFriendRequest
			} else {
				action = AddFriendActionType.Unfriend
			}
			break
		}
		default: {
			res.statusWithLogMessage(
				HTTP_STATUS_METHOD_NOT_ALLOWED,
				`invalid method in friend request`
			)
			res.end()
			return
		}
	}
	try {
		await friendRequest(
			userId,
			friendId,
			{
				action
			}
		)
	} catch (e) {
		if (isAddFriendError(e)) {
			const setMessageAsErrorType = setMessageAsErrorTypeGenerator(
				AddFriendErrorType,
				e.addFriendErrorType,
				res
			)

			switch (e.addFriendErrorType) {
				case AddFriendErrorType.BadFriendId:
				case AddFriendErrorType.FriendAndUserAreTheSameId:
				case AddFriendErrorType.FriendDoesntExist:
				case AddFriendErrorType.AcceptWasNotProvidedButFriendRequestAlreadyExists:
				case AddFriendErrorType.TriedToAcceptButThereWasNothingToAccept:
				case AddFriendErrorType.CantAcceptTwice:
				case AddFriendErrorType.CantCancelAFriendRequestThatYouNeverMade:
				case AddFriendErrorType.CantUnfriendSomeoneWhosNotYourFriend:
					res.statusWithLogMessage(
						HTTP_STATUS_BAD_REQUEST,
						AddFriendErrorType[e.addFriendErrorType]
					)
					setMessageAsErrorType()
					break
				case AddFriendErrorType.InvalidMethod:
					res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
					setMessageAsErrorType()
					break
				case AddFriendErrorType.DbCorrupt:
					res.statusWithLogMessage(
						HTTP_STATUS_INTERNAL_SERVER_ERROR,
						'db corrupt'
					)
					setMessageAsErrorType('db corrupt')
					break
				default:
					// make sure we exhausted all possibilities
					assertUnreachable(e.addFriendErrorType)
			}
		} else {
			// unknown error
			throw e
		}
	}
	res.end()
})
