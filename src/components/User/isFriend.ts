import { UserPublicSearchResult } from '../../lib/api/users/UserPublic'
import { FriendshipTypeResponse } from '../../lib/api/users/[id]/FriendshipType'

export function isFriend(user: UserPublicSearchResult): boolean{
	return user.status === FriendshipTypeResponse.AcceptedByYou ||
		user.status === FriendshipTypeResponse.AcceptedByOther
}