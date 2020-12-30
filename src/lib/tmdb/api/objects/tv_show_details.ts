/* eslint-disable camelcase */
import type { TvShow } from './tv_show';
import type { Person } from './person';
import type { Genre } from './genre';
import type { Network } from './network';
import type { Company } from './company';
import type { Season } from './season';

export interface TvShowDetails extends TvShow {
	created_by: Person[];
	episode_run_time: number[];
	genres: Genre[];
	homepage: string;
	in_production: boolean;
	languages: string[];
	networks: Network[];
	number_of_episodes: number;
	number_of_seasons: number;
	production_companies: Company[];
	seasons: Season[];
	status: string;
	type: string;
	last_air_date: Date;
}
