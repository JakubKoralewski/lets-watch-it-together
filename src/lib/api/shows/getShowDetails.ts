import tmdb, { TmdbPath, TvGetDetails } from 'lib/tmdb/tmdb'
import { TMDBTvGetDetailsResponse } from '../../tmdb/api/tv_get_details'
import { TmdbId, TmdbIdType } from '../../tmdb/api/id'

enum GetShowDetailsErrorType {
	Other,
	NotFound
}

class GetShowDetailsError extends Error {
	constructor(
		public errorType: GetShowDetailsErrorType,
		public mapMessage?: string
	) {
		super(mapMessage)
	}
}

export default async function getShowDetails(
	showTmdbId: TmdbId
): Promise<TMDBTvGetDetailsResponse> {
	if (showTmdbId.type !== TmdbIdType.Show) {
		throw new GetShowDetailsError(
			GetShowDetailsErrorType.Other,
			`can only get tv show details, got` +
			`${JSON.stringify(showTmdbId)}`
		)
	}
	const tvGetDetailsPath =
		`/tv/${showTmdbId.id as number}` as TmdbPath<TvGetDetails>
	let response: TMDBTvGetDetailsResponse
	try {
		const rawResponse = await tmdb.call<TvGetDetails>(
			tvGetDetailsPath as TmdbPath<TvGetDetails>,
			{}
		)
		response = {
			...rawResponse,
			id: {
				id: rawResponse.id,
				type: TmdbIdType.Show
			}
		}
	} catch (e) {
		throw new GetShowDetailsError(
			GetShowDetailsErrorType.Other,
			JSON.stringify(e)
		)
	}
	return response
}
