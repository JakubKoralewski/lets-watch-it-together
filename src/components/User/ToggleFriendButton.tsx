import { Button, PropTypes } from '@material-ui/core'
import { FriendshipTypeResponse } from '../../lib/api/user/[id]/FriendshipType'
import assertUnreachable from '../../lib/utils/assertUnreachable'
import {UserPublicSearchResult} from '../../lib/UserPublic'

export interface ToggleFriendButtonProps {
	sendFriendRequest(userId: UserPublicSearchResult['id']): Promise<void>,
	cancelFriendRequest(userId: UserPublicSearchResult['id']): Promise<void>,
	acceptFriendRequest(userId: UserPublicSearchResult['id']): Promise<void>,
	unfriend(userId: UserPublicSearchResult['id']): Promise<void>,
	userStatus: UserPublicSearchResult['status'],
	userId: UserPublicSearchResult['id'],
	setUserStatus: (status: UserPublicSearchResult['status']) => void,
	onClick(): void
}

export default function ToggleFriendButton({
	sendFriendRequest,
	cancelFriendRequest,
	acceptFriendRequest,
	unfriend,
	userStatus,
	userId,
	setUserStatus,
	onClick
}: ToggleFriendButtonProps): JSX.Element
{
	const friendToggleButton: (
		text: string,
		onClick: () => void,
		color: PropTypes.Color
	) => JSX.Element =
		(text, onClick, color = 'primary') => (
			<Button
				variant={'contained'}
				color={color}
				disabled={false}
				onClick={onClick}
			>
				{text}
			</Button>
		)
	let buttonText: string
	let buttonColor: PropTypes.Color = 'primary'
	let innerOnClick: () => unknown

	/* Active or not active button */
	switch (userStatus) {
		case FriendshipTypeResponse.CancelledByYou:
		case FriendshipTypeResponse.CancelledByOther:
		case FriendshipTypeResponse.NotFriends:
			buttonText = 'Invite'
			innerOnClick = () => {
				sendFriendRequest(userId).then(() => {
					setUserStatus(FriendshipTypeResponse.RequestedByYou)
				})
			}
			break
		case FriendshipTypeResponse.RequestedByOther:
			buttonText = 'Accept Invite'
			innerOnClick = () => {
				acceptFriendRequest(userId).then(() => {
					setUserStatus(FriendshipTypeResponse.AcceptedByYou)
				})
			}
			break
		case FriendshipTypeResponse.AcceptedByOther:
		case FriendshipTypeResponse.AcceptedByYou:
			innerOnClick = () => {
				unfriend(userId).then(() => {
					setUserStatus(FriendshipTypeResponse.NotFriends)
				})
			}
			buttonText = 'Unfriend'
			buttonColor = 'secondary'
			break
		case FriendshipTypeResponse.RequestedByYou:
			buttonText = 'Cancel invite'
			innerOnClick = () => {
				cancelFriendRequest(userId).then(() => {
					setUserStatus(FriendshipTypeResponse.NotFriends)
				})
			}
			buttonColor = 'secondary'
			break
		default: {
			assertUnreachable(userStatus)
		}
	}
	const newOnClick = async () => {
		await innerOnClick()
		onClick()
	}

	return friendToggleButton(
		buttonText,
		newOnClick,
		buttonColor
	)
}
