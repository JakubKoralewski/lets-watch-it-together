/* eslint-disable camelcase */
import { TmdbSeasonId } from '../id'

export interface Season {
	id: TmdbSeasonId;
	episode_count: number;
	poster_path: string;
	season_number: number;
	air_date: Date;
}
