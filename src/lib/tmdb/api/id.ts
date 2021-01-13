import { Movie } from './objects/movie'
import { TvShow } from './objects/tv_show'
import { Person } from './objects/person'
import { Season } from './objects/season'
import { Company } from './objects/company'
import { Collection } from './objects/collection'
import { MediaLike, TmdbMediaType } from '@prisma/client'
import { TvShowDetails } from './objects/tv_show_details'
import { createLogger, LoggerTypes } from '../../logger'
import {invert} from 'lodash'
import { Dictionary } from '@reduxjs/toolkit'


export enum TmdbIdType {
	Movie,
	Show,
	Person,
	Collection,
	Season,
}

export const privateIdToPrismaIdTypeMap = {
	[TmdbIdType.Movie]: TmdbMediaType.MOVIE,
	[TmdbIdType.Show]: TmdbMediaType.SHOW,
	[TmdbIdType.Season]: TmdbMediaType.SEASON,
} as const

export const prismaTmdbMediaTypeToPrivate = {
	[TmdbMediaType.MOVIE]: TmdbIdType.Movie,
	[TmdbMediaType.SHOW]: TmdbIdType.Show,
	[TmdbMediaType.SEASON]: TmdbIdType.Season
}

export interface TmdbId {
	id: TmdbIds,
	type: TmdbIdType
}
const serializePrefixMap = {
	[TmdbIdType.Movie]: 'm',
	[TmdbIdType.Show]: 't',
	[TmdbIdType.Collection]: 'l',
	[TmdbIdType.Person]: 'p',
	[TmdbIdType.Season]: 's'
} as const

/** https://stackoverflow.com/a/37697429/10854888 */
const deserializePrefixMap =
	invert(serializePrefixMap) as unknown as Record<'m' | 't' | 'l' | 'p' | 's', TmdbIdType>

/** Server code*/
export function serializeId(
	id: TmdbId
): TmdbIdSerialized {
	return `${serializePrefixMap[id.type]}${id.id}` as TmdbIdSerialized
}

/** Client code */
export function deserializeId(
	serializedId: TmdbIdSerialized
): TmdbId {
	if(!serializedId || !(typeof serializedId === 'string') || serializedId.length <= 2) {
		throw Error(`serializedId.A "${serializedId}"`)
	}
	const type = serializedId[0]
	if(!(type in deserializePrefixMap)) {
		throw Error(`serializedId.C "${serializedId}" ${JSON.stringify(deserializePrefixMap)}`)
	}
	const actualType = deserializePrefixMap[
		type as keyof typeof deserializePrefixMap
	]
	const id = serializedId.slice(1)
	let numberId: number
	try {
		numberId = parseInt(id)
	} catch(e) {
		throw Error(`serializedId.B "${serializedId}"`)
	}
	return {
		type: actualType,
		id: numberId
	}
}

const logger = createLogger(LoggerTypes.TmdbId, false)

/** Server code */
export const mediaLikeToId = (
	mediaLike: MediaLike
): TmdbId => {
	if(!(mediaLike.type in prismaTmdbMediaTypeToPrivate)) {
		const msg = `mediaLike.type unknown while converting to tmdbId`
		const err = new Error(msg)
		logger.error({
			msg,
			err,
			mediaLike,
			prismaTmdbMediaTypeToPrivate
		})
		throw err
	} else {
		return {
			type:
				prismaTmdbMediaTypeToPrivate[
					mediaLike.type as keyof typeof prismaTmdbMediaTypeToPrivate
				],
			id: mediaLike.tmdbId
		}
	}
}

export type TmdbMovieId = number
export type TmdbMovieIdSerialized = `m${TmdbMovieId}`
export type TmdbShowId = number
export type TmdbShowIdSerialized = `t${TmdbShowId}`
export type TmdbPersonId = number
export type TmdbPersonIdSerialized = `p${TmdbPersonId}`
export type TmdbSeasonId = number
export type TmdbSeasonIdSerialized = `s${TmdbSeasonId}`
export type TmdbCollectionId = number
export type TmdbCollectionIdSerialized = `l${TmdbCollectionId}`
export type TmdbCompanyId = number
export type TmdbCompanyIdSerialized = `c${TmdbCompanyId}`

export type TmdbIds =
	TmdbMovieId | TmdbShowId | TmdbPersonId |
	TmdbSeasonId | TmdbCollectionId | TmdbCompanyId


export type TmdbIdSerialized =
	TmdbMovieIdSerialized | TmdbShowIdSerialized |
	TmdbPersonIdSerialized | TmdbSeasonIdSerialized

export type ObjectsWithIds =
	Movie | TvShow | Person |
	Season | Collection | Company

// export type ObjectsWithTmdbIds =
// 	Exclude<ObjectsWithIds, 'id'> & { id: TmdbId }
export type ObjectsWithTmdbIds =
	Omit<Movie, 'id'> & { id: TmdbId & {type: TmdbIdType.Movie} } |
		Omit<TvShow, 'id'> & {id: TmdbId & {type: TmdbIdType.Show}} |
		Omit<TvShowDetails, 'id'> & {id: TmdbId & {type: TmdbIdType.Show}} |
		Omit<Person, 'id'> & {id: TmdbId & {type: TmdbIdType.Person}} |
		Omit<Season, 'id'> & {id: TmdbId & {type: TmdbIdType.Season}} |
		Omit<Collection, 'id'> & {id: TmdbId & {type: TmdbIdType.Collection}}
export type ImdbMediaId = `tt${number}`