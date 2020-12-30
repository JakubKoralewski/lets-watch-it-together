import tmdb, { Find, TmdbPath } from 'lib/tmdb/tmdb'
import { TMDBFindResponse } from '../../tmdb/api/find'

enum MapImdbIdToTmdbIdErrorType {
	NoTTAtBeginning,
	Other,
	NotFound
}

class MapImdbIdToTmdbIdError extends Error {
	constructor(
		public errorType: MapImdbIdToTmdbIdErrorType,
		public mapMessage?: string
	) {
		super(mapMessage)
	}
}

export default async function mapImdbIdToTmdbId(
	imdbId: string
): Promise<TMDBFindResponse> {
	if (imdbId.slice(0, 2) !== 'tt') {
		throw new MapImdbIdToTmdbIdError(
			MapImdbIdToTmdbIdErrorType.NoTTAtBeginning
		)
	}
	const findPath = `/find/${imdbId}` as TmdbPath<Find>
	let response: TMDBFindResponse;
	try {
		response = await tmdb.call<Find>(findPath as TmdbPath<Find>, {
			external_source: 'imdb_id',
		})
	} catch (e) {
		throw new MapImdbIdToTmdbIdError(
			MapImdbIdToTmdbIdErrorType.Other,
			JSON.stringify(e)
		)
	}
	const possibleResponses  = ['movie_results', 'tv_results']
	for(const possibleResponse of possibleResponses) {
		if(response[possibleResponse].length > 0) {
			return response[possibleResponse][0].id
		}
	}
	throw new MapImdbIdToTmdbIdError(
		MapImdbIdToTmdbIdErrorType.NotFound
	)
}
