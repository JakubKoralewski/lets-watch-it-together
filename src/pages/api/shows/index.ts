import { getSession } from 'next-auth/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { constants } from 'http2'
import { ApiShowsRequest } from 'lib/api/shows/ApiShowsRequest'
import mapImdbIdToTmdbId from 'lib/api/shows/mapImdbIdToTmdbId'
import getShowDetails from 'lib/api/shows/getShowDetails'
import { stripDetails, StrippedShowDetails } from
	'lib/api/shows/[id]/StrippedShowDetails'
import { ImdbMediaId } from 'lib/tmdb/api/id'
import { TMDBTvGetDetailsResponse } from 'lib/tmdb/api/tv_get_details'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
	HTTP2_METHOD_POST
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log('/api/shows')
	if (session) {
		switch (req.method) {
			case HTTP2_METHOD_POST: {
				let json: ApiShowsRequest
				try {
					json = JSON.parse(req.body)
				} catch {
					res.status(HTTP_STATUS_BAD_REQUEST)
					res.end()
					return
				}
				if ('imdbIds' in json) {
					console.log('imdbids')
					if (json.imdbIds.length === 0) {
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.end()
						return
					}
					const tmdbIds = await Promise.allSettled(
						json.imdbIds.map(
							(imdbId) =>
								mapImdbIdToTmdbId(imdbId as ImdbMediaId)
						)
					)
					if (req.query['convert']) {
						console.log('convert')
						const details: TMDBTvGetDetailsResponse[] = (
							await Promise.allSettled(
								tmdbIds.map(tmdbId => {
									if (tmdbId.status === 'fulfilled') {
										return getShowDetails(tmdbId.value)
									} else {
										console.error({ tmdbId })
									}
								}).filter(x => Boolean(x))
							)
						).map(detail => {
							if (detail.status === 'fulfilled') {
								return detail.value
							} else {
								console.error({ detail })
							}
						}).filter(x => Boolean(x))

						if (req.query['small']) {
							console.log('small')
							const strippedDetails: StrippedShowDetails[] =
								details.map(stripDetails)

							console.log(
								JSON.stringify(
									{ strippedDetails },
									undefined,
									2
								)
							)
							res.json(strippedDetails)
						} else if (req.query['all']) {
							res.json(details)
						} else {
							console.error('invalid')
						}
					} else {
						console.log('tmdbIds', tmdbIds)
						res.json(tmdbIds)
					}
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
				} else if ('tmdbIds' in json) {
					if (json.tmdbIds.length === 0) {
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.end()
						return
					}
					console.error('TODO: unimplemented')
					const tmdbIds = json.tmdbIds
				} else {
					console.error('wrong data invalid json key')
					res.status(HTTP_STATUS_BAD_REQUEST)
					res.json({message: `wrong data invalid json key`})
					res.end()
					return
				}
				break
			}
		}
		// Signed in
		console.log(
			'Session',
			JSON.stringify(session, null, 2)
		)
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
