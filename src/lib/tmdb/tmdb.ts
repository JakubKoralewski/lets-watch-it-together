import redis, { RedisWrapperClass } from '../redis/redis-wrapper'
import got, { Response as GOTResponse } from 'got'
import { TMDBFindResponse } from './api/find'
import { TMDBTvGetDetailsResponse } from './api/tv_get_details'
import { TvShowDetails } from './api/objects/tv_show_details'

export type Find = `find/${string}`
export type FindOptions = { external_source: 'imdb_id' | string }
export type FindResult = TMDBFindResponse

export type TvGetDetails = `tv/${number}`
export type TvGetDetailsOptions = Record<string, never>
export type TvGetDetailsResult = TvShowDetails

export type GlobalTmdbOptions = { language?: string }
export type SupportedTmdbPaths = Find | TvGetDetails

export type TmdbPath<T extends SupportedTmdbPaths> = `/${T | string}`

export type TmdbPathOptions<T extends SupportedTmdbPaths> = (
	T extends Find ? {
		o: FindOptions;
		r: FindResult
	} : T extends TvGetDetails ? {
		o: TvGetDetailsOptions,
		r: TvGetDetailsResult
	} : T extends string ? {
		o: Record<string, string>;
		r: any
	} : {
		o: never;
		r: never
	}) & { o: GlobalTmdbOptions }

export type HTTPMethod = 'GET' | 'POST'

enum TmdbErrorType {
	Redis,
	Tmdb,
	Http,
}

class TmdbError extends Error {
	constructor(
		public tmdbErrorType: TmdbErrorType,
		public tmdbMessage: string
	) {
		super(`TmdbError: [${tmdbErrorType}]: ${tmdbMessage}`)
	}
}

class TmdbClient {
	private apiString: string

	constructor(
		private apiKey: string,
		private redis: RedisWrapperClass,
		private version: 3
	) {
		this.apiString = 'https://api.themoviedb.org/3'
	}

	private optionsToQueryString<T extends SupportedTmdbPaths>(
		options: TmdbPathOptions<T>['o']
	) {
		const keys = Object.keys(options)
		if (keys.length === 0) {
			return ''
		}
		const createPair = (key: string, value: string) =>
			`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		let queryString = `?${createPair(keys[0], options[keys[0]])}`
		keys.slice(1).forEach((key) => {
			queryString += `&${createPair(key, options[key])}`
		})
		return queryString
	}

	private makeApiString<T extends SupportedTmdbPaths>(
		path: TmdbPath<T>,
		options: TmdbPathOptions<T>['o']
	) {
		return (
			this.apiString +
			path +
			this.optionsToQueryString(
				{
					...options,
					api_key: this.apiKey
				}
			)
		)
	}

	private static getRedisKey(apiUrl: string, method: HTTPMethod) {
		return `tmdb/${method}/${apiUrl}`
	}

	public async call<T extends SupportedTmdbPaths>(
		path: TmdbPath<T>,
		options: TmdbPathOptions<T>['o'],
		method: HTTPMethod = 'GET'
	): Promise<TmdbPathOptions<T>['r']> {
		/** Construct the url for request */
		const apiUrl = this.makeApiString(path, options)
		/** Construct the key used to check cache hit in Redis */
		const redisKey = TmdbClient.getRedisKey(apiUrl, method)
		let cache

		try {
			cache = await this.redis.get(redisKey)
		} catch {
			throw new TmdbError(
				TmdbErrorType.Redis,
				`get ${redisKey}`
			)
		}

		if (cache) {
			/* Cache hit */
			return JSON.parse(cache)
		}
		/* Cache miss */

		/* Make request to TMDb*/
		let response: GOTResponse<string>
		try {
			response = await got(apiUrl, {
				method: method
			})
		} catch (e) {
			throw new TmdbError(
				TmdbErrorType.Http,
				`http get "${apiUrl}" with ${method} ${JSON.stringify(e)}`
			)
		}

		if (response.statusCode < 300) {
			/* Ok response from TMDb */

			/** No need to really await */
			void this.redis.set(redisKey, response.body).catch((reason) => {
				console.error(
					new TmdbError(
						TmdbErrorType.Redis,
						`set ${redisKey}, reason: ${reason}`
					)
				)
			})
		} else {
			/* Invalid response from TMDb */

			throw new TmdbError(
				TmdbErrorType.Tmdb,
				JSON.stringify({
					body: response.body,
					statusCode: response.statusCode,
					headers: response.rawHeaders
				})
			)
		}

		return JSON.parse(response.body)
	}
}

export default new TmdbClient(process.env.TMDB_API_KEY, redis, 3)
