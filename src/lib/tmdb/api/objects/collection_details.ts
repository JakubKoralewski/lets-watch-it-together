import type { Collection } from './collection';
import type { Movie } from './movie';
export interface CollectionDetails extends Collection {
	overview: string;
	parts: Movie[];
}
