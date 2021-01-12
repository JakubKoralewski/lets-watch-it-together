import { NextApiRequest, NextApiResponse } from 'next'
import { constants } from 'http2'
import getShowDetails from 'lib/api/shows/getShowDetails'
import { stripDetails, StrippedShowDetails } from 'lib/api/shows/[id]/StrippedShowDetails'
import { TmdbIdType } from 'lib/tmdb/api/id'
import { mapShowLiked } from '../../../../lib/api/shows/[id]/isShowLiked'
import { protectedApiHandler } from '../../../../lib/api/utils/protectedApiHandler'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP2_METHOD_GET,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default protectedApiHandler(async (req, res,  session) => {
	const userId: number = session.user.id
	// Signed in
	let showTmdbId: number
	try {
		showTmdbId = parseInt(req.query.id as string)
	} catch {
		res.status(HTTP_STATUS_BAD_REQUEST)
		res.end()
		return
	}

	switch (req.method) {
		case HTTP2_METHOD_GET: {
			const details = await getShowDetails(
				{
					id: showTmdbId,
					type: TmdbIdType.Show
				}
			)
			const strippedDetails =
				stripDetails(details)
			const mappingFunc = mapShowLiked<typeof strippedDetails>(userId)
			const strippedDetailsWithLiked: StrippedShowDetails =
				await mappingFunc(strippedDetails)
			res.jsonWithLog(strippedDetailsWithLiked)
			res.end()
			return
		}
		default: {
			res.log.error('unsupported method', req.method)
			res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
			res.end()
			return
		}
	}
	res.end()
})
