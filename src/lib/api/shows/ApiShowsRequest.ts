export type ApiShowsRequest = {
	imdbIds: string[];
} | {
	imdbId: string;
} | {
	tmdbId: string
}

export const enum ApiTmdbMediaType {
	TV,
	Movie,
	Person,
	Season,
	Episode
}

export type ApiTmdbMediaResponse = {
	id: number;
	type: ApiTmdbMediaType
}

export type ApiShowsResponse = {
	tmdbIds: ApiTmdbMediaResponse[]
}