import { NextApiResponseWithEnforcedLogging } from '../../logger/apiLogger'
import { NextApiRequest } from 'next'
import { constants } from 'http2'
const { HTTP_STATUS_BAD_REQUEST } = constants

export function getIdAsNumber(
	req: NextApiRequest,
	res: NextApiResponseWithEnforcedLogging,
	errorMessage ='url invalid/id was not set'
): {error: Error, id: undefined} | {id: number, error: undefined} {
	let id: number
	try {
		id = parseInt(req.query.id as string)
	} catch(e) {
		res.statusWithLogMessage(
			HTTP_STATUS_BAD_REQUEST,
			errorMessage
		)
		res.end()
		return {error: e, id: undefined}
	}
	return {id, error: undefined}
}
/**
 *  Creates a child function that given the enum object
 *  and enum value to the parent, the child
 *  function maps the enum value (number) to its key by
 *  indexing into the enum object effectively generating
 *  a string error message.
 */
export function setMessageAsErrorTypeGenerator(
	errorEnum: unknown & Record<number, string>,
	errType: number,
	res: NextApiResponseWithEnforcedLogging
) {
	return (message?: string): void => res.jsonWithLog(
		{
			message,
			errType: errorEnum[errType],
		}
	)
}
