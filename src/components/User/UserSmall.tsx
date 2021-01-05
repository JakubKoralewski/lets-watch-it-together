import { UserPublicSearchResult } from '../../lib/UserPublic'
import { AccountBox } from '@material-ui/icons'
import { Avatar, Box, Button, makeStyles, PropTypes } from '@material-ui/core'
import { FriendshipTypeResponse } from '../../lib/api/user/[id]/FriendshipType'
import assertUnreachable from '../../lib/utils/assertUnreachable'
import { useState } from 'react'

export interface UserSmallProps {
	user: UserPublicSearchResult,
	className?: string,
	onPrimaryActionTaken: () => void
}

const useStyles = makeStyles((theme) => ({
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7)
	}
}))

async function sendFriendRequest(id: number) {
	await fetch(`/api/users/${id}/friend`, { method: 'POST' })
}

async function acceptFriendRequest(id: number) {
	await fetch(`/api/users/${id}/friend`, { method: 'PATCH' })
}

async function unfriend(id: number) {
	await fetch(`/api/users/${id}/friend`, { method: 'DELETE' })
}

async function cancelFriendRequest(id: number) {
	await fetch(`/api/users/${id}/friend?cancel=1`, { method: 'DELETE' })
}

export default function UserSmall(
	{
		user,
		className,
		onPrimaryActionTaken
	}: UserSmallProps
) {
	const [userStatus, setUserStatus] =
		useState<FriendshipTypeResponse>(user.status)
	const classes = useStyles()
	const buttonType: (
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
	let onClick: () => unknown

	/* Active or not active button */
	switch (userStatus) {
		case FriendshipTypeResponse.CancelledByYou:
		case FriendshipTypeResponse.CancelledByOther:
		case FriendshipTypeResponse.NotFriends:
			buttonText = 'Invite'
			onClick = () => {
				sendFriendRequest(user.id).then(() => {
					setUserStatus(FriendshipTypeResponse.RequestedByYou)
				})
			}
			break
		case FriendshipTypeResponse.RequestedByOther:
			buttonText = 'Accept Invite'
			onClick = () => {
				acceptFriendRequest(user.id).then(() => {
					setUserStatus(FriendshipTypeResponse.AcceptedByYou)
				})
			}
			break
		case FriendshipTypeResponse.AcceptedByOther:
		case FriendshipTypeResponse.AcceptedByYou:
			onClick = () => {
				unfriend(user.id).then(() => {
					setUserStatus(FriendshipTypeResponse.NotFriends)
				})
			}
			buttonText = 'Unfriend'
			buttonColor = 'secondary'
			break
		case FriendshipTypeResponse.RequestedByYou:
			buttonText = 'Cancel invite'
			onClick = () => {
				cancelFriendRequest(user.id).then(() => {
					setUserStatus(FriendshipTypeResponse.NotFriends)
				})
			}
			buttonColor = 'secondary'
			break
		default: {
			assertUnreachable(userStatus)
		}

	}
	const onClickWithPrimaryAction = async () => {
		await onClick()
		onPrimaryActionTaken()
	}
	return (
		<Box className={className}>
			<Avatar alt={user.name} src={user.image} className={classes.large}>
				{!user.image && <AccountBox />}
			</Avatar>
			{user.name}
			{
				buttonType(
					buttonText,
					onClickWithPrimaryAction,
					buttonColor
				)
			}
		</Box>
	)
}