import { TMDBTvGetDetailsResponse } from '../../../tmdb/api/tv_get_details'

export type StrippedShowDetails = Pick<
	TMDBTvGetDetailsResponse,
	'poster_path' | 'seasons' | 'name' | 'id' | 'first_air_date'
> & {liked: boolean}

export const stripDetails = (full: TMDBTvGetDetailsResponse):
	Omit<StrippedShowDetails, 'liked'> => (
	{
		id: full.id,
		poster_path: full.poster_path,
		name: full.name,
		seasons: full.seasons,
		first_air_date: full.first_air_date,
	}
)