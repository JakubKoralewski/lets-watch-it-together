import { Movie } from './objects/movie'
import { TvShow } from './objects/tv_show'
import { Person } from './objects/person'
import { Season } from './objects/season'
import { Company } from './objects/company'
import { Collection } from './objects/collection'

export enum TmdbIdType {
	Movie,
	Show,
	Person,
	Collection,
	Season
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

export function serializeId(
	id: TmdbId
) {
	return `${serializePrefixMap[id.type]}${id.id}`
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

type ObjectsWithIds = Movie | TvShow | Person | Season | Collection | Company
/*
export function serializeId(
	object: Movie
): Movie & {id: TmdbMovieIdSerialized}
export function serializeId(
	object: TvShow
): TvShow & {id: TmdbShowIdSerialized}
export function serializeId(
	object: Person
): Person & {id: TmdbPersonIdSerialized}
export function serializeId(
	object: Season
): Season & {id: TmdbSeasonIdSerialized}
export function serializeId(
	object: Collection
): Collection & {id: TmdbCollectionIdSerialized}
export function serializeId(
	object: Company
): Company & {id: TmdbCompanyIdSerialized}
export function serializeId(
	object: ObjectsWithIds
) {
	return {
		...object,
		id: ('title' in object) ?
			`m${object.id}` as TmdbMovieIdSerialized :
			'original_name' in object ?
				`t${object.id}` as TmdbShowIdSerialized :
				'profile_path' in object ?
					`p${object.id}` as TmdbPersonIdSerialized :
					'episode_count' in object ?
						`s${object.id}` as TmdbSeasonIdSerialized :
						'backdrop_path' in object ?
							`l${object.id}` as TmdbCollectionIdSerialized :
							'logo_path' in object ?
								`c${object.id}` as TmdbCompanyIdSerialized :
								undefined
	}
}
*/
/*: T & {
	id: T extends Movie ?
		TmdbMovieIdSerialized :
		T extends TvShow ?
			TmdbShowIdSerialized :
			T extends Person ?
				TmdbPersonIdSerialized :
				T extends Season ?
					TmdbSeasonIdSerialized :
					T extends Collection ?
						TmdbCollectionIdSerialized
						: T extends Company ?
						TmdbCompanyIdSerialized :
						never
}*/

/*
(Movie & {id: TmdbMovieIdSerialized}) |
	(TvShow & {id: TmdbShowIdSerialized}) |
	(Person & {id: TmdbPersonIdSerialized}) |
	(Season & {id: TmdbSeasonIdSerialized}) |
	(Collection & {id: TmdbCollectionIdSerialized}) |
	(Company & {id: TmdbCompanyIdSerialized})
 */
export type ImdbMediaId = `tt${number}`