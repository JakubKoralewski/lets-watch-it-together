import { Box, InputAdornment, makeStyles, TextField } from '@material-ui/core'
import { useEffect, useRef, useState } from 'react'
import { UserPublicSearchResult } from '../../../lib/api/users/UserPublic'
import useDebounced from '../../../lib/utils/useDebounced'
import { AccountCircle, Search } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'
import UserSmall from '../../User/UserSmall'
import { GoToNextStageProps, NextOrSkipWrapper } from './NextOrSkipWrapper'
import { User } from 'next-auth'


export const useFriendsStyles = makeStyles((theme) => ({
	userSmall: {
		margin: theme.spacing(3)
	},
	clickable: {
		cursor: 'pointer'
	},
	usersContainer: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	root: {
		flexGrow: 1
	}
}))

export function AddFriends(
	{
		nextStage,
		currentStage,
		maxStage,
		prevStage
	}: GoToNextStageProps
): JSX.Element {
	const styles = useFriendsStyles()

	// TODO: maybe get 10 users and show them at beginning?
	// FIXME: maybe hide, throw away users who dont match anymore?
	const [foundUsers, setFoundUsers] =
		useState<Record<string, UserPublicSearchResult>>({})

	const [searching, setSearching] =
		useState(false)

	const [searchString, setSearchString] =
		useState<string>('')

	const fetchSearch = async (
		searchString: string
	): Promise<UserPublicSearchResult[]> => {
		const response = await fetch(
			`/api/search/users?q=${encodeURI(searchString)}`
		)
		return response.json().catch((reason) => {
			console.error('response error', reason)
		})
	}
	// const handler = useDebounced(search)
	const search = async (user: string) => {
		setSearching(true)
		const searchResults: UserPublicSearchResult[] =
			await fetchSearch(user)

		// console.log({searchResults})
		if (searchResults && searchResults.length > 0) {
			const mappedResults: Record<number, UserPublicSearchResult> = {}
			searchResults.forEach(usr => {
				mappedResults[usr.id] = usr
			})
			setFoundUsers(old =>
				({ ...old, ...mappedResults })
			)
		}
		setSearching(false)
	}
	const loaded = useRef(false)

	useEffect(() => {
		if (!loaded.current) {
			loaded.current = true
			return
		}
		void search(searchString)
	}, [searchString])


	const debouncedSetInput = useDebounced(
		async (search) => {
			if (search.length > 1) {
				setSearchString(search)
			}
		}
	)

	const [primaryActionTaken, setPrimaryActionTaken] = useState(false)
	const onPrimaryActionTaken = () => setPrimaryActionTaken(true)
	const foundUsersValues = Object.values(foundUsers)


	return (
		<NextOrSkipWrapper
			nextStage={nextStage}
			canGoForward={primaryActionTaken}
			currentStage={currentStage}
			maxStage={maxStage}
			prevStage={prevStage}
		>
			<Box>Add Friends</Box>
			<Box>
				<TextField
					id="outlined-basic"
					label={`Search users${process.env.NODE_ENV === 'development' ? ' (type "my")' : ''}`}
					variant="outlined"
					onChange={
						(e) => debouncedSetInput(e.target.value.trim())
					}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccountCircle />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<Search
									className={styles.clickable}
									onClick={
										() => search(searchString)
									}
								/>
							</InputAdornment>
						)
					}}
				/>
			</Box>
			<Box
				className={styles.usersContainer}
			>
				{
					searching &&
					[0, 1, 2].map(i =>
						<UserSmall
							key={i}
							isLoading={true}
							user={{} as UserPublicSearchResult}
						/>
					)
				}
				{
					foundUsersValues.length === 0 ?
						<div>No users found 😥</div> :
						foundUsersValues.map(usr =>
							<UserSmall
								key={usr.id}
								user={usr}
								className={styles.userSmall}
								onFriendToggle={onPrimaryActionTaken}
							/>
						)
				}
			</Box>
		</NextOrSkipWrapper>
	)
}
