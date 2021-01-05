import { TvShowDetails } from './objects/tv_show_details'
import { TmdbId } from './id'

export type TMDBTvGetDetailsResponse = Omit<TvShowDetails, 'id'> &
	{id: TmdbId}