import { getSession } from 'next-auth/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { constants } from 'http2'
import { ApiShowsRequest } from '../../../lib/api/shows/ApiShowsRequest'
import mapImdbIdToTmdbId from '../../../lib/api/shows/mapImdbIdToTmdbId'
const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	if (session) {
		switch (req.method) {
			case 'POST': {
				let json: ApiShowsRequest
				try {
					json = JSON.parse(req.body)
				} catch {
					res.status(HTTP_STATUS_BAD_REQUEST)
					res.end()
					return
				}
				if ('imdbIds' in json) {
					if (json.imdbIds.length === 0) {
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.end()
						return
					}
					const tmdbIds = await Promise.allSettled(
						json.imdbIds.map((imdbId) => mapImdbIdToTmdbId(imdbId))
					)
					console.log('tmdbIds', tmdbIds)
					res.json(tmdbIds)
					res.end()
					return
				} else if ('imdbId' in json) {
					/*todo*/
					/*
					if(json.imdbId.length === 0) {
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.end()
					}
*/
				} else if ('tmdbId' in json) {
					/*todo*/
				} else {
					console.error('wrong data')
					res.status(HTTP_STATUS_BAD_REQUEST)
					res.end()
					return
				}
				break
			}
		}
		// Signed in
		console.log('Session', JSON.stringify(session, null, 2))
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
