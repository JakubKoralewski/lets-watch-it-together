import { Box, Typography } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { UserPublicSearchResult } from 'lib/api/users/UserPublic'
import { Skeleton } from '@material-ui/lab'
import UserSmall from '../../User/UserSmall'
import { GoToNextStageProps, NextOrSkipWrapper } from './NextOrSkipWrapper'
import { useFriendsStyles } from './AddFriends'
import { AnimatePresence, motion } from 'framer-motion'

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
		useState(Object.keys(friends).length > 0)

	const fetchUsers = async (): Promise<UserPublicSearchResult[]> => {
		const response = await fetch(
			`/api/friends`, { method: 'GET' }
		)
		return response.json().catch((reason) => {
			console.error('response error', reason)
		})
	}

	/**
	 *  Maybe put this in getServerSideProps
	 *  but I don't know how to exactly make this happen.
	 */
	const getFriends = async () => {
		setLoading(true)
		const friendsResults: UserPublicSearchResult[] =
			await fetchUsers()

		// console.log({searchResults})
		if (friendsResults && friendsResults.length > 0) {
			const mappedResults: Record<number, UserPublicSearchResult> = {}
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

	const friendsValues = Object.values(friends)
	let friendsElement: JSX.Element

	if (friendsValues.length > 0) {
		friendsElement = (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				{
					friendsValues.map(usr =>
						<UserSmall
							key={usr.id}
							user={usr}
							className={friendsStyles.userSmall}
							onNewMeetingPress={onPrimaryActionTaken}
						/>
					)
				}
			</motion.div>
		)
	} else {
		friendsElement = (
			<motion.div
				initial={{ opacity: 0, height: '100%' }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0, height: 0 }}
			>
				{`Get some friends first 😥`}
			</motion.div>
		)
	}
	if (loading) {
		friendsElement = (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0, height: 0 }}
			>
				{
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
			</motion.div>
		)
	}

	return (
		<NextOrSkipWrapper
			nextStage={nextStage}
			canGoForward={primaryActionTaken}
			currentStage={currentStage}
			maxStage={maxStage}
			prevStage={prevStage}
		>
			<Box>
				<Typography>
					Select friend to add meeting with
				</Typography>
			</Box>
			<Box
				className={friendsStyles.usersContainer}
			>
				<AnimatePresence
					initial={false}
					exitBeforeEnter={true}
				>
					{
						friendsElement
					}
				</AnimatePresence>
			</Box>
		</NextOrSkipWrapper>
	)
}
