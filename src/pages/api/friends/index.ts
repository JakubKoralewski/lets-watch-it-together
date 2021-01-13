import { constants } from 'http2'
import { getFriends } from '../../../lib/api/friends/getFriends'
import { YourFriend } from '../../../lib/api/friends/mapFriendsDbToClient'
import { protectedApiHandler } from '../../../lib/api/utils/protectedApiHandler'

const {
	HTTP2_METHOD_GET,
	HTTP_STATUS_METHOD_NOT_ALLOWED
} = constants

export default protectedApiHandler(async (req, res, session) => {
	const userId: number = session.user.id

	switch (req.method) {
		case HTTP2_METHOD_GET: {
			const friends: YourFriend[] = await getFriends(userId)
			res.jsonWithLog(friends)
			res.end()
			return
		}
		default: {
			res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
			res.end()
			return
		}
	}
})
