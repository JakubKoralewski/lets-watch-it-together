/* eslint-disable camelcase */
import { TmdbCollectionId } from '../id'

export interface Collection {
	id: TmdbCollectionId;
	backdrop_path: string;
	name: string;
	poster_path: string;
}
