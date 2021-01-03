/* eslint-disable camelcase */
import type { Movie } from './objects/movie';
import type { Person } from './objects/person';
import type { TvShow } from './objects/tv_show';

export interface TMDBFindResponse {
	movie_results: Movie[];
	person_results: Person[];
	tv_results: TvShow[];
	tv_episode_results: unknown[];
	tv_season_results: unknown[];
}
