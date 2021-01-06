import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { constants } from 'http2'
import getShowDetails, {
	GetShowDetailsErrorType,
	isGetShowDetailsError
} from 'lib/api/shows/getShowDetails'
import { TmdbIdType } from 'lib/tmdb/api/id'
import prisma from 'lib/prisma/prisma'
import {TmdbMediaType} from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
	HTTP2_METHOD_POST,
	HTTP2_METHOD_DELETE,
	HTTP_STATUS_CONFLICT,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log(`"/api/shows/${req.query.id}/like" with ${req.method}`)
	if (session) {
		const shouldDislike = Boolean(req.method === HTTP2_METHOD_DELETE)
		const userId: number = session.user['id']
		// Signed in
		let showTmdbId: number
		try {
			showTmdbId = parseInt(req.query.id as string)
		} catch {
			res.status(HTTP_STATUS_BAD_REQUEST)
			res.end()
			return
		}

		switch (req.method) {
			case HTTP2_METHOD_DELETE:
			case HTTP2_METHOD_POST: {
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
					if(
						isGetShowDetailsError(e) &&
						e.errorType === GetShowDetailsErrorType.NotFound
					) {
						// return different error if id doesn't exist
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.json(
							{
								message: `show with tmdb id ${showTmdbId} does not exist`
							}
						)
						res.end()
						return
					} else {
						// and a different error if id is wrong for other,
						// unknown reasons
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.json(
							{
								message: `unknown problem with tmdb show id ${showTmdbId}`
							}
						)
						res.end()
						return
					}
				}
				// happy path: id is correct
				// https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#one-to-many-relations

				try {
					await prisma.user.update({
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
					if(e instanceof PrismaClientKnownRequestError) {
						// https://www.prisma.io/docs/concepts/components/prisma-client/error-reference
						if(e.code === 'P2002') {
							// "Unique constraint failed on the ${constraint}"
							res.status(HTTP_STATUS_CONFLICT)
							res.json(
								{
									message: `tmdb show id ${showTmdbId} already liked`
								}
							)
							res.end()
							return
						}
					} else {
						// unknown error
						throw e
					}
				}

				res.end()
				return
			}
			default: {
				console.error('unsupported method', req.method)
				res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
				res.end()
				return
			}
		}
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
