/* eslint-disable camelcase */
import type { Movie } from './movie';
import type { TvShow } from './tv_show';
import { TmdbPersonId } from '../id'

export interface Person {
	id: TmdbPersonId;
	name: string;
	profile_path: string;
	adult: boolean;
	popularity: number;
	known_for: Array<Movie | TvShow>;
}
