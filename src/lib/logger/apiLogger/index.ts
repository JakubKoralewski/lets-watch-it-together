import process from "process"
import { NextApiRequest, NextApiResponse } from 'next'
import {Logger} from 'pino'
import { LoggerTypes, createLogger } from '..'

/**
 * The below is printed to stdout on each api request
 * i think it makes sense to minify
 */
interface SerializedRequest {
	/** http version*/
	v: string;
	/** url */
	u: string;
	/** body */
	b: unknown;
	/** method*/
	m: string;
	/** cookies */
	c: unknown;
	/** query */
	q: unknown;
	/** headers */
	h: unknown;
	/** trailers */
	t: unknown
}

interface SerializedResponse {
	/** whether finished */
	f: boolean;
	/** whether writable */
	w: boolean;
	/** whether destroyed */
	d: boolean;
	/** status code */
	sc: number;
	/** status message */
	sm: string | undefined;
}

type NextApiResponseMetadata = {
	/** For benchmarking */
	startTime: ReturnType<typeof process.hrtime>
	/** Can be undefined until body was set */
	body?: unknown,
	statusMessage?: unknown,
	/** Response id (autoincrement)*/
	rId: number
}

enum ApiLoggerLogType {
	Response='rp',
	Request='rq',
}

export type NextApiResponseWithEnforcedLogging<T=any> = Omit<NextApiResponse<T>, 'send' | 'json'> & {
	log: Logger,
	jsonWithLog: NextApiResponse<T>['json'],
	statusWithLogMessage:
		(
			status: Parameters<NextApiResponse<T>['status']>[0],
			message: unknown
		) => ReturnType<NextApiResponse<T>['status']>,
	metadata?: NextApiResponseMetadata & {req: NextApiRequestWithMetadata}
}
type NextApiRequestWithMetadata = NextApiRequest & {
	metadata?: Pick<NextApiResponseMetadata, 'rId'> & {res: NextApiResponseWithEnforcedLogging}
}

class ApiLogger {
	private loggerWithoutCallSiteInfo: Logger
	private loggerWithCallSiteInfo: Logger
	private responseCounter = 0

	constructor() {
		this.loggerWithoutCallSiteInfo = createLogger(LoggerTypes.ApiTrace, false)
		this.loggerWithCallSiteInfo = createLogger(LoggerTypes.ApiError, true)
	}

	private static serializeNextApiRequest(
		req: NextApiRequest
	): SerializedRequest {
		return {
			v: req.httpVersion,
			u: req.url,
			b: req.body,
			m: req.method,
			c: req.cookies,
			q: req.query,
			h: req.headers,
			t: req.trailers
		}
	}

	private static serializeNextApiResponse(
		res: NextApiResponseWithEnforcedLogging
	): SerializedResponse {
		return {
			f: res.finished,
			d: res.destroyed,
			w: res.writable,
			sc: res.statusCode,
			sm: res.statusMessage
		}
	}

	public apiRouteRequest(req: NextApiRequest) {
		this.loggerWithoutCallSiteInfo.debug({
			req: ApiLogger.serializeNextApiRequest(req),
			md: {
				rId:
					(req as NextApiRequestWithMetadata).metadata &&
					(req as NextApiRequestWithMetadata).metadata.rId,
			},
			_t: ApiLoggerLogType.Request
		})
	}

	public apiRouteResponse(res: NextApiResponseWithEnforcedLogging) {
		let loggingLevel: 'debug' | 'error' = 'debug' as const
		let logger = this.loggerWithoutCallSiteInfo
		if(res.statusCode >= 400) {
			loggingLevel = 'error' as const
			logger = this.loggerWithCallSiteInfo
		}
		logger[loggingLevel]({
			res: ApiLogger.serializeNextApiResponse(res),
			md: res.metadata && {
				b: res.metadata.body,
				t: process.hrtime(res.metadata.startTime),
				rId: res.metadata.rId,
				sm: res.metadata.statusMessage,
				req: {
					url: res.metadata?.req.url,
					met: res.metadata?.req.method,
					rId: res.metadata?.req.metadata?.rId,
					// nice bod bae
					bod: res.metadata?.body
				}
			},
			_t: ApiLoggerLogType.Response
		})
	}

	/**
	 *  Actually adds the new properties to be able to
	 *  log the response body.
	 */
	public applyLoggingMiddleware(req: NextApiRequest, res: NextApiResponse) {
		// Set metadata without body
		(
			res as Record<string, any> as  NextApiResponseWithEnforcedLogging
		).metadata = {
			startTime: process.hrtime(),
			rId: this.responseCounter,
			req
		}
		;(
			req as Record<string, any>
		).metadata = {
			rId: this.responseCounter,
			res
		}
		// Set log
		;(res as Record<string, any> as NextApiResponseWithEnforcedLogging).log =
			this.loggerWithCallSiteInfo.child({rId: this.responseCounter})

		// Set statusWithLogMessage
		;(res as Record<string, any> as NextApiResponseWithEnforcedLogging)
			.statusWithLogMessage = (status, message) => {
				res.status(status)
				;(res as Record<string, any> as NextApiResponseWithEnforcedLogging)
					.metadata.statusMessage = message
				return res
			}

		// Set jsonWithLog
		;(res as Record<string, any>)['jsonWithLog'] = (body: unknown) => {
			// Set body on metadata
			(
				res as Record<string, any> as NextApiResponseWithEnforcedLogging
			).metadata.body = body
			res.json(body)
		}

		// Increment response id's
		this.responseCounter += 1
	}
}

export const apiLogger = new ApiLogger