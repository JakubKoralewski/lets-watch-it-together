import assertUnreachable from 'lib/utils/assertUnreachable'
import {
	getUserDetails,
	GetUserDetailsErrorType,
	isGetUserDetailsError
} from '../../../../lib/api/users/[id]/getUserDetails'
import { protectedApiHandler } from '../../../../lib/api/utils/protectedApiHandler'
import { getIdAsNumber, setMessageAsErrorTypeGenerator } from '../../../../lib/api/utils/validation'
import { UserDetails } from '../../../../lib/api/users/UserDetails'

export default protectedApiHandler(async (
	req,
	res,
	session
): Promise<void> => {
	// Signed in
	const sessionUserId = session.user.id

	const {id: userId, error} = getIdAsNumber(req, res)
	if(error) {
		return
	}
	let userDetails: UserDetails

	try {
		userDetails = await getUserDetails(
			sessionUserId,
			userId,
			false
		)
	} catch (e) {
		if (isGetUserDetailsError(e)) {
			const setMessageAsErrorType = setMessageAsErrorTypeGenerator(
				GetUserDetailsErrorType,
				e.getUserDetailsErrorType,
				res
			)

			switch (e.getUserDetailsErrorType) {
				case GetUserDetailsErrorType.CantGetInformationAboutYourself:
				case GetUserDetailsErrorType.ClientLiedAboutBeingFriends:
				case GetUserDetailsErrorType.UserIdDoesntExist:
					setMessageAsErrorType()
					break
				default:
					// make sure we exhausted all possibilities
					assertUnreachable(e.getUserDetailsErrorType)
			}
		} else {
			// unknown error
			throw e
		}
	}
	res.jsonWithLog(userDetails)
	res.end()
})
