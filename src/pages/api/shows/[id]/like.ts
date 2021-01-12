import { constants } from 'http2'
import { User } from '@prisma/client'
import { protectedApiHandler } from 'lib/api/utils/protectedApiHandler'
import { NextApiRequest } from 'next'
import { getIdAsNumber } from 'lib/api/utils/validation'
import {
	isLikeShowError,
	likeShow,
	LikeShowActionType,
	LikeShowErrorType
} from 'lib/api/shows/[id]/likeShow'
import assertUnreachable from 'lib/utils/assertUnreachable'

const {
	HTTP_STATUS_INTERNAL_SERVER_ERROR,
	HTTP_STATUS_BAD_REQUEST,
	HTTP2_METHOD_DELETE,
	HTTP_STATUS_CONFLICT,
} = constants


export default protectedApiHandler(
	async (req: NextApiRequest, res, session
	) => {
		const shouldDislike = Boolean(req.method === HTTP2_METHOD_DELETE)
		const userId: number = session.user.id
		// Signed in
		const { id: showTmdbId, error } = getIdAsNumber(req, res)
		if (error) {
			return
		}
		let updatedUser: User
		try {
			updatedUser = await likeShow(
				userId,
				showTmdbId,
				{
					action: shouldDislike ?
						LikeShowActionType.Dislike :
						LikeShowActionType.Like
				}
			)
		} catch (e) {
			if (isLikeShowError(e)) {
				switch (e.likeShowErrorType) { // eslint-disable-next-line max-len
					case LikeShowErrorType.ShowAlreadyLikedAccordingToDatabaseConstraintFromPrisma: {
						res.statusWithLogMessage(HTTP_STATUS_CONFLICT, e)
						res.jsonWithLog(
							{
								message: `tmdb show id ${showTmdbId} already liked`
							}
						)
						res.end()
						return
					}
					case LikeShowErrorType.// eslint-disable-next-line max-len
						CantMakeUserWithProvidedIdLikeShowBecauseTheDatabaseToldMeThatTheProvidedUserIdDoesntExistFromPrisma:// eslint-disable-next-line max-len
					case LikeShowErrorType.ShowIdDoesntExistOrIsNotAValidShowIdAccordingToTmdbApi: {
						res.statusWithLogMessage(HTTP_STATUS_BAD_REQUEST, e)
						res.end()
						return
					}
					case LikeShowErrorType.PrismaClientKnownRequestErrorButICantHandleIt: // eslint-disable-next-line max-len
					case LikeShowErrorType.OtherErrorWhileCheckingIfProvidedShowIdExistsFromGetShowDetailsThatICantHandle: // eslint-disable-next-line max-len
					case LikeShowErrorType.UnknownErrorWhileLikingOrDislikingShowWithTheProvidedUserIdAndTmdbIdFromPrisma: {
						res.statusWithLogMessage(HTTP_STATUS_INTERNAL_SERVER_ERROR, e)
						res.end()
						return
					}
					default: {
						assertUnreachable(e.likeShowErrorType)
					}
				}
			}
		}
		res.log.trace({
			msg: `liking show updatedUser`,
			uu: updatedUser
		})
		res.end()
	}
)
