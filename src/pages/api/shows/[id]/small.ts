import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { constants } from 'http2'
import getShowDetails from 'lib/api/shows/getShowDetails'
import { stripDetails, StrippedShowDetails } from 'lib/api/shows/[id]/StrippedShowDetails'
import { TmdbId, TmdbIdType } from 'lib/tmdb/api/id'
import { mapShowLiked } from '../../../../lib/api/shows/[id]/isShowLiked'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
	HTTP2_METHOD_GET,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log(`/api/shows/${req.query.id}/small`)
	if (session) {
		const userId: number = session.user['id']
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
				res.json(strippedDetailsWithLiked)
				res.end()
				return
			}
			default: {
				console.error('unsupported method', req.method)
				res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
				res.end()
				return
			}
		}
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
