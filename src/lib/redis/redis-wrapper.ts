import { promisify } from 'util'
import redis, { RedisClient } from 'redis'
import { createLogger, LoggerTypes } from '../logger'
const logger = createLogger(LoggerTypes.Redis)
/**
 * https://www.npmjs.com/package/@types/redis
 * https://github.com/NodeRedis/node-redis
 */
class RedisWrapper {
	private client: RedisClient
	public get: (key: string) => Promise<string | null>
	public set: (key: string, value: string) => Promise<boolean>
	constructor(connectionString: string) {
		logger.debug(`creating redis client with string "${connectionString}"`)
		this.client = redis.createClient({ url: connectionString })
		this.get = promisify(this.client.get).bind(this.client)
		this.set = promisify(this.client.set).bind(this.client)
	}
}
export type RedisWrapperClass = RedisWrapper

export default new RedisWrapper(process.env.REDIS_URL)
