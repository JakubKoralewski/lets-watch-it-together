import { getSession } from 'lib/api/utils/getSession'
import { constants } from 'http2'
import { ApiShowsRequest } from 'lib/api/shows/ApiShowsRequest'
import mapImdbIdToTmdbId from 'lib/api/shows/mapImdbIdToTmdbId'
import getShowDetails from 'lib/api/shows/getShowDetails'
import { stripDetails, StrippedShowDetails } from
	'lib/api/shows/[id]/StrippedShowDetails'
import { ImdbMediaId } from 'lib/tmdb/api/id'
import { TMDBTvGetDetailsResponse } from 'lib/tmdb/api/tv_get_details'
import { mapShowLiked } from 'lib/api/shows/[id]/isShowLiked'
import { protectedApiHandler } from '../../../lib/api/utils/protectedApiHandler'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP2_METHOD_POST
} = constants

export default protectedApiHandler(async (req, res, session) => {
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
				res.log.debug('imdbids')
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
					res.log.debug('convert')
					const details: TMDBTvGetDetailsResponse[] = (
						await Promise.allSettled(
							tmdbIds.map(tmdbId => {
								if (tmdbId.status === 'fulfilled') {
									return getShowDetails(tmdbId.value)
								} else {
									res.log.error({ tmdbId })
								}
							}).filter(x => Boolean(x))
						)
					).map(detail => {
						if (detail.status === 'fulfilled') {
							return detail.value
						} else {
							res.log.error({ detail })
						}
					}).filter(x => Boolean(x))

					if (req.query['small']) {
						res.log.debug('small')
						const strippedDetailsWithLikesResult = await Promise.allSettled(
							(details as TMDBTvGetDetailsResponse[])
								// strip full details to its small form
								.map(stripDetails)
								// add the information whether the show is liked
								.map(mapShowLiked(session.user['id'] as number))
						)
						const strippedDetailsWithLikes: StrippedShowDetails[] =
							strippedDetailsWithLikesResult
								.flatMap(result => {
									// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#For_adding_and_removing_items_during_a_map
									if (result.status === 'rejected') {
										res.log.error('error in mapping show details to have likes')
										return []
									} else {
										return [result.value]
									}
								})

						res.log.debug(
							JSON.stringify(
								{ strippedDetailsWithLikes },
								undefined,
								2
							)
						)
						res.jsonWithLog(strippedDetailsWithLikes)
					} else if (req.query['all']) {
						res.jsonWithLog(details)
					} else {
						res.log.error('invalid')
					}
				} else {
					res.log.debug('tmdbIds', tmdbIds)
					res.jsonWithLog(tmdbIds)
				}
				res.end()
				return
			} else if ('imdbId' in json) {
				/*todo: single imdbid*/
				res.jsonWithLog('TODO: unimplemented imdbId')
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
				res.jsonWithLog('TODO: unimplemented tmdbIds')
				const tmdbIds = json.tmdbIds
			} else {
				res.statusWithLogMessage(HTTP_STATUS_BAD_REQUEST, 'wrong data invalid json key')
				res.jsonWithLog({ message: `wrong data invalid json key` })
				res.end()
				return
			}
			break
		}
	}
	res.end()
})
