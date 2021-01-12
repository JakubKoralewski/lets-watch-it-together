import getShowDetails, { GetShowDetailsErrorType, isGetShowDetailsError } from '../getShowDetails'
import { TmdbIdType } from '../../../tmdb/api/id'
import prisma from '../../../prisma/prisma'
import { TmdbMediaType, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ErrorInLibWithLogging, LibErrorType } from '../../../logger/libLogger'
import { GetFriendsError } from '../../friends/getFriends'

export enum LikeShowActionType {
	Like,
	Dislike
}

export interface LikeShowParams {
	action: LikeShowActionType
}

export enum LikeShowErrorType {
	ShowIdDoesntExistOrIsNotAValidShowIdAccordingToTmdbApi,
	OtherErrorWhileCheckingIfProvidedShowIdExistsFromGetShowDetailsThatICantHandle,
	ShowAlreadyLikedAccordingToDatabaseConstraintFromPrisma,
	// eslint-disable-next-line max-len
	CantMakeUserWithProvidedIdLikeShowBecauseTheDatabaseToldMeThatTheProvidedUserIdDoesntExistFromPrisma,
	PrismaClientKnownRequestErrorButICantHandleIt,
	UnknownErrorWhileLikingOrDislikingShowWithTheProvidedUserIdAndTmdbIdFromPrisma,
}

export class LikeShowError extends ErrorInLibWithLogging<LikeShowErrorType> {
	constructor(
		public likeShowErrorType: LikeShowErrorType,
		public mapMessage?: unknown,
		public parentError?: Error
	) {
		super(
			{
				libErrorType: LibErrorType.LikeShow,
				innerEnum: LikeShowErrorType,
				innerErrorEnumValue: likeShowErrorType,
				parentError,
				libErrorMessage: JSON.stringify(mapMessage)
			}
		)
	}
}

export function isLikeShowError(err: Error):
	err is LikeShowError
{
	return (
		err instanceof LikeShowError ||
		(
			typeof err === 'object' && ('likeShowErrorType' in err)
		)
	)
}

export async function likeShow(
	userId: number,
	showTmdbId: number,
	{ action }: LikeShowParams
): Promise<User> {
	try {
		// try to get show details to make sure the show exists
		// i.e. to check if the given id is correct
		// we're not interested in the returned details though
		await getShowDetails(
			{
				id: showTmdbId,
				type: TmdbIdType.Show
			}
		)
	} catch (e) {
		// we catch error to check if the reason of the error is
		// that the provided id is not a valid show, then we return
		// a different non-generic error
		if (
			isGetShowDetailsError(e) &&
			e.getShowDetailsErrorType === GetShowDetailsErrorType.NotFound
		) {
			// return different error if id doesn't exist
			throw new LikeShowError(
				LikeShowErrorType.ShowIdDoesntExistOrIsNotAValidShowIdAccordingToTmdbApi,
				'show doesnt exist or the id is not a show',
				e
			)
		} else {
			// and a different error if id is wrong for other,
			// unknown reasons
			throw new LikeShowError(
				LikeShowErrorType.// eslint-disable-next-line max-len
					OtherErrorWhileCheckingIfProvidedShowIdExistsFromGetShowDetailsThatICantHandle,
				'unknown error while checking if show exists',
				e
			)
		}
	}
	// happy path: id is correct
	// https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#one-to-many-relations
	let updatedUser: User
	const shouldDislike = action === LikeShowActionType.Dislike

	try {
		updatedUser = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				liked: shouldDislike ? {
					delete: {
						tmdbId_type_userId: {
							userId,
							tmdbId: showTmdbId,
							type: TmdbMediaType.SHOW
						}
					}
				} : {
					create: {
						tmdbId: showTmdbId,
						type: TmdbMediaType.SHOW
					}
				}
			}
		})
	} catch (e) {
		// we catch the error because the database may throw an error
		// that the unique constraint is not satisfied, meaning that
		// the the show has already been liked
		if (e instanceof PrismaClientKnownRequestError) {
			// https://www.prisma.io/docs/concepts/components/prisma-client/error-reference
			switch (e.code) {
				case ('P2002'): {
					// "Unique constraint failed on the ${constraint}"
					throw new LikeShowError(
						LikeShowErrorType.ShowAlreadyLikedAccordingToDatabaseConstraintFromPrisma,
						'show already liked or sth prisma',
						e
					)
				}
				case ('P2001'): {
					throw new LikeShowError(
						LikeShowErrorType.
							// eslint-disable-next-line max-len
							CantMakeUserWithProvidedIdLikeShowBecauseTheDatabaseToldMeThatTheProvidedUserIdDoesntExistFromPrisma,
						'userid invalid from prisma',
						e
					)
				}
				default: {
					throw new LikeShowError(
						LikeShowErrorType.PrismaClientKnownRequestErrorButICantHandleIt,
						'unknown known error from prisma',
						e
					)

				}
			}
		} else {
			// unknown error
			throw new LikeShowError(
				LikeShowErrorType.
					// eslint-disable-next-line max-len
					UnknownErrorWhileLikingOrDislikingShowWithTheProvidedUserIdAndTmdbIdFromPrisma,
				'unknown error in prisma request',
				e
			)
		}
	}
	return updatedUser
}