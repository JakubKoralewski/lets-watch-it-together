import { TvShowDetails } from './objects/tv_show_details'
import { TmdbId, TmdbIdType, TmdbShowIdSerialized } from './id'

export type TMDBTvGetDetailsResponse = Omit<TvShowDetails, 'id'> &
	{id: TmdbId & {type: TmdbIdType.Show}}