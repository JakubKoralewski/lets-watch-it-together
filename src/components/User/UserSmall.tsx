import { UserPublicSearchResult } from '../../lib/api/users/UserPublic'
import { AccountBox } from '@material-ui/icons'
import { Avatar, makeStyles } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { FriendshipTypeResponse } from '../../lib/api/users/[id]/friend/FriendshipType'
import { PropsWithChildren, useEffect, useState } from 'react'
import ToggleFriendButton from './ToggleFriendButton'
import CreateMeetingButton from './CreateMeetingButton'
import { isFriend } from '../../lib/api/friends/isFriend'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { Skeleton } from '@material-ui/lab'

export interface UserSmallProps {
	user: UserPublicSearchResult,
	className?: string,
	onFriendToggle?: () => void,
	onNewMeetingPress?: () => void,
	isLoading?: boolean,
	additionalContent?: JSX.Element
}

const useStyles = makeStyles((theme) => ({
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7)
	}
}))


export default function UserSmall(
	{
		user,
		className,
		onFriendToggle,
		onNewMeetingPress,
		isLoading,
		additionalContent
	}: UserSmallProps
): JSX.Element {
	const [userStatus, setUserStatus] =
		useState<FriendshipTypeResponse>(user.status)
	const router = useRouter()
	const classes = useStyles()
	const customProps = { layoutId: `userSmall${user.id}` }
	const routerUrl = `/user/${user.id}/meetings/new`
	useEffect(() => {
		void router.prefetch(
			routerUrl
		)
	}, [])
	const onNewMeetingButtonClick = async () => {
		onNewMeetingPress && onNewMeetingPress()
		console.log({routerUrl})
		await router.push(
			routerUrl,
			undefined
		)
	}
	return (
		<Card
			className={className}
			component={motion.div as any}
			{...customProps}
		>
			<CardContent>
				<Avatar
					alt={user.name}
					src={user.image}
					className={classes.large}
				>
					{
						!isLoading && !user.image ? <AccountBox /> : <Skeleton />
					}
				</Avatar>
				<Typography>
					{isLoading ? <Skeleton /> : user.name}
				</Typography>
				{additionalContent}
			</CardContent>
			<CardActions>
				{
					!isLoading &&
										<ToggleFriendButton
											sendFriendRequest={sendFriendRequest}
											cancelFriendRequest={cancelFriendRequest}
											acceptFriendRequest={acceptFriendRequest}
											unfriend={unfriend}
											userStatus={userStatus}
											userId={user.id}
											setUserStatus={setUserStatus}
											onClick={onFriendToggle}
										/>
				}
				{
					!isLoading && onNewMeetingPress && isFriend(user) &&
										<CreateMeetingButton
											onClick={onNewMeetingButtonClick}
										/>
				}
			</CardActions>
		</Card>
	)
}