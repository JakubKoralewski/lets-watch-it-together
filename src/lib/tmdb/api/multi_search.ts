/* eslint-disable camelcase */
import type { Movie } from './objects/movie';
import type { Person } from './objects/person';
import type { TvShow } from './objects/tv_show';

export interface TMDBMultiSearchResponse {
	page: number;
	results: Array<Movie | Person | TvShow>;
	total_results: number;
	total_pages: number;
}
