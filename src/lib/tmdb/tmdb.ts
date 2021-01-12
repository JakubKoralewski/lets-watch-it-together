import redis, { RedisWrapperClass } from '../redis/redis-wrapper'
import got, { Method as GOTMethod, Response as GOTResponse } from 'got'
import { TMDBFindResponse } from './api/find'
import { TvShowDetails } from './api/objects/tv_show_details'
import { IncomingHttpHeaders } from 'http'
import HTTPMethod from '../utils/HTTPMethod'
import { ErrorInLibWithLogging, LibErrorType } from '../logger/libLogger'
import { createLogger, LoggerTypes } from '../logger'

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

export enum TmdbErrorType {
	Redis,
	Tmdb,
	Http,
	NoApiKey
}

const traceLogger = createLogger(LoggerTypes.Tmdb, false)

export type TmdbErrorTmdbResponse = {
	body: string,
	statusCode: number,
	headers: IncomingHttpHeaders
	// headers: response.rawHeaders
} & Record<string, unknown>

export class TmdbError<T extends TmdbErrorType>
	extends ErrorInLibWithLogging<TmdbErrorType> {
	constructor(
		public tmdbErrorType: T,
		public tmdbMessage: T extends TmdbErrorType.Tmdb ?
			TmdbErrorTmdbResponse : string
	) {
		super(
			LibErrorType.Tmdb,
			TmdbErrorType,
			tmdbErrorType,
			JSON.stringify(tmdbMessage)
		)
	}
}

export function isTmdbError<T extends TmdbErrorType>(err: Error):
	err is TmdbError<T> {
	return err && typeof err === 'object' && 'tmdbMessage' in err
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

	/** Convert the given options query parameters to set in the
	 *  URL.
	 */
	private optionsToQueryString<T extends SupportedTmdbPaths>(
		options: TmdbPathOptions<T>['o']
	) {
		const keys = Object.keys(options)
		if (keys.length === 0) {
			return ''
		}
		const createPair = (key: string, value: string) =>
			`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		let queryString = `?${createPair(keys[0], (options as Record<string, string>)[keys[0]])}`
		keys.slice(1).forEach((key) => {
			queryString += `&${createPair(key, (options as Record<string, string>)[key])}`
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
		method: HTTPMethod = HTTPMethod.GET
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
			traceLogger.debug({
				c: 'hit'
			})
			/* Cache hit */
			return JSON.parse(cache)
		}
		traceLogger.debug({
			c: 'miss'
		})
		/* Cache miss */

		/* Make request to TMDb*/
		let response: GOTResponse<string>
		try {
			response = await got(apiUrl, {
				method: method as GOTMethod
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
				throw new TmdbError(
					TmdbErrorType.Redis,
					`set ${redisKey}, reason: ${reason}`
				)
			})
		} else {
			/* Invalid response from TMDb */

			throw new TmdbError(
				TmdbErrorType.Tmdb,
				{
					message: 'invalid response from tmdb',
					body: response.body,
					statusCode: response.statusCode,
					headers: response.headers

					// headers: response.rawHeaders
				}
			)
		}

		return JSON.parse(response.body)
	}
}

if (!process.env.TMDB_API_KEY) {
	throw new TmdbError(
		TmdbErrorType.NoApiKey,
		'TMDB_API_KEY environment variable not set!'
	)
}
const client = new TmdbClient(process.env.TMDB_API_KEY, redis, 3)

export default client
