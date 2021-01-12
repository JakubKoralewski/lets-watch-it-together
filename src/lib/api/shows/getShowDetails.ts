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
	extends ErrorInLibWithLogging<GetShowDetailsErrorType> {
	constructor(
		public getShowDetailsErrorType: GetShowDetailsErrorType,
		public mapMessage?: string,
		public parentError?: Error,
	) {
		super(
			{
				parentLogger: undefined,
				parentError,
				libErrorType: LibErrorType.GetShowDetails,
				libErrorMessage: mapMessage,
				innerErrorEnumValue: getShowDetailsErrorType,
				innerEnum: GetShowDetailsErrorType
			}
		)
	}
}

export function isGetShowDetailsError(err: unknown):
	err is GetShowDetailsError {
	return Boolean(err && typeof err === 'object' && 'getShowDetailsErrorType' in err)
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
		if (isTmdbError(e)) {
			if (e.tmdbErrorType === TmdbErrorType.Tmdb) {
				if ((e.tmdbMessage as TmdbErrorTmdbResponse).statusCode === 404) {
					throw new GetShowDetailsError(
						GetShowDetailsErrorType.NotFound,
						undefined,
						e
					)
				}
			} else {
				throw new GetShowDetailsError(
					GetShowDetailsErrorType.Tmdb,
					undefined,
					e
				)
			}
		} else {
			throw new GetShowDetailsError(
				GetShowDetailsErrorType.Other,
				undefined,
				e
			)
		}
	}
	return response
}
