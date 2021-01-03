/* eslint-disable camelcase */
import type { Movie } from './movie';
import type { Collection } from './collection';
import type { Genre } from './genre';
import type { Company } from './company';
import type { Country } from './country';
import type { Language } from './language';

export interface MovieDetails extends Movie {
	belongs_to_collection: Collection;
	budget: number;
	genres: Genre[];
	homepage: string;
	imdb_id: string;
	production_companies: Company[];
	production_countries: Country[];
	revenue: number;
	runtime: number;
	spoken_languages: Language[];
	status: string;
	tagline: string;
}
