import { NextApiRequest, NextApiResponse } from 'next'
import { getSession, SessionWithId } from './getSession'
import { constants } from 'http2'
import { apiLogger, NextApiResponseWithEnforcedLogging } from '../../logger/apiLogger'

const { HTTP_STATUS_UNAUTHORIZED } = constants

export type ApiHandler =
	(req: NextApiRequest, res: NextApiResponseWithEnforcedLogging) => Promise<void>
export type AuthorizedApiHandler = (
	req: NextApiRequest,
	res: NextApiResponseWithEnforcedLogging,
	session: SessionWithId
) => Promise<void>

/**
 *  TODO: setup typing of the query and body
 *  TODO: setup openapi generation from this function somehow
 *        either code analysis or maybe some sort of side effects
 *        on deployment? not sure. see notion devblog
 *        https://github.com/gcanti/io-ts
 * */
export function protectedApiHandler(
	apiHandler: AuthorizedApiHandler
): ApiHandler {
	return async function(
		req: NextApiRequest,
		res: NextApiResponseWithEnforcedLogging
	): Promise<void> {
		apiLogger.applyLoggingMiddleware(req, res as unknown as NextApiResponse)
		apiLogger.apiRouteRequest(req)
		//TODO: maybe do the logging for not protected api handlers too
		//      but we dont have any nonprotected api handlers...

		const session = await getSession({ req })
		if (!session) {
			// Not Signed in
			res.status(HTTP_STATUS_UNAUTHORIZED)
			res.end()
			apiLogger.apiRouteResponse(res)
		} else {
			await apiHandler(req, res, session)
			apiLogger.apiRouteResponse(res)
		}
	}
}