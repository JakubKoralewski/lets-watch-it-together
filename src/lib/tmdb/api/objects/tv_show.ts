/* eslint-disable camelcase */
import { TmdbShowId } from '../id'

export interface TvShow {
	id: TmdbShowId;
	name: string;
	original_name: string;
	poster_path: string;
	popularity: number;
	backdrop_path: string;
	vote_average: number;
	overview: string;
	origin_country: string[];
	genre_ids: number[];
	original_language: string;
	vote_count: number;
	/** yyyy-mm-dd */
	first_air_date: string;
}
