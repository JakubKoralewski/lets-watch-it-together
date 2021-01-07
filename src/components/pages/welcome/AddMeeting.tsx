import { Box, InputAdornment, makeStyles, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { UserPublicSearchResult } from '../../../lib/UserPublic'
import useDebounced from '../../../lib/utils/useDebounced'
import { AccountCircle, Search } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'
import UserSmall from '../../User/UserSmall'
import { GoToNextStageProps, NextOrSkipWrapper } from './NextOrSkipWrapper'
import { useFriendsStyles } from './AddFriends'


export function AddMeeting(
	{
		nextStage,
		currentStage,
		maxStage,
		prevStage
	}: GoToNextStageProps
): JSX.Element {
	const friendsStyles = useFriendsStyles()

	const [friends, setFriends] =
		useState<Record<string, UserPublicSearchResult>>({})

	const [loading, setLoading] =
		useState(false)

	const fetchUsers = async (): Promise<UserPublicSearchResult[]> => {
		const response = await fetch(
			`/api/friends`, {method: 'GET'}
		)
		return response.json().catch((reason) => {
			console.error('response error', reason)
		})
	}
	// const handler = useDebounced(search)
	const getFriends = async () => {
		setLoading(true)
		const friendsResults: UserPublicSearchResult[] =
			await fetchUsers()

		// console.log({searchResults})
		if (friendsResults && friendsResults.length > 0) {
			const mappedResults = {}
			friendsResults.forEach(usr => {
				mappedResults[usr.id] = usr
			})
			setFriends(old =>
				({ ...old, ...mappedResults })
			)
		}
		setLoading(false)
	}

	useEffect(() => {
		setLoading(false)
		getFriends().catch((err) => {
			console.error('get friends failed', err)
		})
	}, [])

	const [primaryActionTaken, setPrimaryActionTaken] = useState(false)
	const onPrimaryActionTaken = () => setPrimaryActionTaken(true)


	return (
		<NextOrSkipWrapper
			nextStage={nextStage}
			canGoForward={primaryActionTaken}
			currentStage={currentStage}
			maxStage={maxStage}
			prevStage={prevStage}
		>
			<Box>Select friend to add meeting with</Box>
			<Box
				className={friendsStyles.usersContainer}
			>
				{
					loading &&
					[0, 1, 2].map(i =>
						<Skeleton
							key={i}
							variant={'rect'}
							width={300}
							height={100}
							className={friendsStyles.userSmall}
						/>
					)
				}
				{
					Object.values(friends)
						.map(usr =>
							<UserSmall
								key={usr.id}
								user={usr}
								className={friendsStyles.userSmall}
								onPrimaryActionTaken={onPrimaryActionTaken}
							/>
						)
				}
			</Box>
		</NextOrSkipWrapper>
	)
}
