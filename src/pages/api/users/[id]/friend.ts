import { constants } from 'http2'
import {
	addFriend, AddFriendErrorType, isAddFriendError
} from 'lib/api/users/[id]/addFriend'
import HTTPMethod from 'lib/utils/HTTPMethod'
import assertUnreachable from 'lib/utils/assertUnreachable'
import { protectedApiHandler } from '../../../../lib/api/utils/protectedApiHandler'
import { Add } from '@material-ui/icons'
import { getIdAsNumber, setMessageAsErrorTypeGenerator } from '../../../../lib/api/utils/validation'
import { GetUserDetailsErrorType } from '../../../../lib/api/users/[id]/getUserDetails'

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

	const {id: friendId, error} = getIdAsNumber(req, res)
	if(error) {
		return
	}

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
