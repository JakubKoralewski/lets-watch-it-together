import { UserPublicSearchResult } from '../../lib/UserPublic'
import { AccountBox } from '@material-ui/icons'
import { Avatar, makeStyles } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { FriendshipTypeResponse } from '../../lib/api/user/[id]/FriendshipType'
import { useState } from 'react'
import ToggleFriendButton from './ToggleFriendButton'
import CreateMeetingButton from './CreateMeetingButton'
import { isFriend } from './isFriend'

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
): JSX.Element {
	const [userStatus, setUserStatus] =
		useState<FriendshipTypeResponse>(user.status)
	const classes = useStyles()
	return (
		<Card className={className}>
			<CardContent>
				<Avatar
					alt={user.name}
					src={user.image}
					className={classes.large}
				>
					{!user.image && <AccountBox />}
				</Avatar>
				<Typography>
					{user.name}
				</Typography>
			</CardContent>
			<CardActions>

				<ToggleFriendButton
					sendFriendRequest={sendFriendRequest}
					cancelFriendRequest={cancelFriendRequest}
					acceptFriendRequest={acceptFriendRequest}
					unfriend={unfriend}
					userStatus={userStatus}
					userId={user.id}
					setUserStatus={setUserStatus}
					onClick={onPrimaryActionTaken}
				/>
				{
					isFriend(user) &&
						<CreateMeetingButton onClick={onPrimaryActionTaken}/>
				}
			</CardActions>
		</Card>
	)
}