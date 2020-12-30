/* eslint-disable camelcase */
import type { Person } from './person';

export interface PersonDetails extends Person {
	also_known_as: string[];
	biography: string;
	birthday: Date;
	deathday: Date;
	gender: number;
	homepage: string;
	imdb_id: string;
	place_of_birth: string;
}
