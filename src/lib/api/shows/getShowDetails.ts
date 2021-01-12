import tmdb, { isTmdbError, TmdbErrorTmdbResponse, TmdbErrorType, TmdbPath, TvGetDetails } from 'lib/tmdb/tmdb'
import { TMDBTvGetDetailsResponse } from '../../tmdb/api/tv_get_details'
import { TmdbId, TmdbIdType } from '../../tmdb/api/id'
import { ErrorInLibWithLogging, LibErrorType } from '../../logger/libLogger'

export enum GetShowDetailsErrorType {
	Other,
	Tmdb,
	NotFound,
	NotAShowId
}

export class GetShowDetailsError
	extends ErrorInLibWithLogging<GetShowDetailsErrorType>
{
	constructor(
		public errorType: GetShowDetailsErrorType,
		public mapMessage?: string,
	) {
		super(
			LibErrorType.GetShowDetails,
			GetShowDetailsErrorType,
			errorType,
			mapMessage
		)
	}
}

export function isGetShowDetailsError(err: unknown):
	err is GetShowDetailsError
{
	return Boolean(err && typeof err === 'object' && 'mapMessage' in err);
}

export default async function getShowDetails(
	showTmdbId: TmdbId
): Promise<TMDBTvGetDetailsResponse> {
	if (showTmdbId.type !== TmdbIdType.Show) {
		throw new GetShowDetailsError(
			GetShowDetailsErrorType.NotAShowId,
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
		if(isTmdbError(e)) {
			if(e.tmdbErrorType === TmdbErrorType.Tmdb) {
				if((e.tmdbMessage as TmdbErrorTmdbResponse).statusCode === 404) {
					throw new GetShowDetailsError(
						GetShowDetailsErrorType.NotFound,
						JSON.stringify(e)
					)
				}
			} else {
				throw new GetShowDetailsError(
					GetShowDetailsErrorType.Tmdb,
					JSON.stringify(e)
				)
			}
		} else {
			throw new GetShowDetailsError(
				GetShowDetailsErrorType.Other,
				JSON.stringify(e)
			)
		}
	}
	return response
}
