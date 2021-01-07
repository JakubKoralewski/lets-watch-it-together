import { UserPublicSearchResult } from '../../lib/UserPublic'
import { FriendshipTypeResponse } from '../../lib/api/user/[id]/FriendshipType'

export function isFriend(user: UserPublicSearchResult): boolean{
	return user.status === FriendshipTypeResponse.AcceptedByYou ||
		user.status === FriendshipTypeResponse.AcceptedByOther
}