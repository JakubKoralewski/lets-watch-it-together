import { ObjectsWithTmdbIds, privateIdToPrismaIdTypeMap, TmdbId, TmdbIdType } from 'lib/tmdb/api/id'
import prisma from 'lib/prisma/prisma'
import {MediaLike} from '@prisma/client'


export enum IsShowLikedErrorType {
	Other,
	NotFound,
	NotAShowOrMovie
}

export class IsShowLikedError extends Error {
	constructor(
		public errorType: IsShowLikedErrorType,
		public mapMessage?: string
	) {
		super(mapMessage)
	}
}

export function isIsShowLikedError(err: unknown):
	err is IsShowLikedError {
	return err instanceof IsShowLikedError
}

type ShowOrMovieTmdbId =
	(ObjectsWithTmdbIds & { id: { type: TmdbIdType.Show | TmdbIdType.Movie } })

export function mapShowLiked<T extends ShowOrMovieTmdbId>(
	userId: number
): (media: T) => Promise<T & { liked: boolean }> {
	return (media) => mapShowLikedInner(media, userId)
}

async function mapShowLikedInner<T extends ShowOrMovieTmdbId>(
	media: T,
	userId: number
): Promise<T & { liked: boolean }> {
	media['liked'] = isShowLiked(media.id, userId)
	return media as (T & { liked: boolean })
}

export async function isShowLiked(
	tmdbId: TmdbId & { type: TmdbIdType.Show | TmdbIdType.Movie },
	userId: number
): Promise<boolean> {
	if (
		tmdbId.type !== TmdbIdType.Show &&
		tmdbId.type !== TmdbIdType.Movie
	) {
		throw new IsShowLikedError(
			IsShowLikedErrorType.NotAShowOrMovie,
			`can only check if tv show or movie is liked` +
			`${JSON.stringify(tmdbId)}`
		)
	}
	const prismaMediaType = privateIdToPrismaIdTypeMap[tmdbId.type]
	let response: {liked: MediaLike[]}
	try {
		response = await prisma.user.findUnique(
			{
				where: {
					id: userId
				},
				select: {
					liked: {
						where: {
							tmdbId: tmdbId.id,
							type: prismaMediaType
						}
					}
				}
			}
		)
	} catch (e) {
		throw new IsShowLikedError(
			// eslint-disable-next-line no-mixed-spaces-and-tabs
			IsShowLikedErrorType.Other,
			JSON.stringify(e)
		)
	}
	return response.liked.length > 0
}
