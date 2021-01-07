import { Box, InputAdornment, makeStyles, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { UserPublicSearchResult } from '../../../lib/UserPublic'
import useDebounced from '../../../lib/utils/useDebounced'
import { AccountCircle, Search } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'
import UserSmall from '../../User/UserSmall'
import { GoToNextStageProps, NextOrSkipWrapper } from './NextOrSkipWrapper'


export const useFriendsStyles = makeStyles((theme) => ({
	userSmall: {
		margin: theme.spacing(7)
	},
	clickable: {
		cursor: 'pointer'
	},
	usersContainer: {
		display: 'flex'
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
			const mappedResults = {}
			searchResults.forEach(usr => {
				mappedResults[usr.id] = usr
			})
			setFoundUsers(old =>
				({ ...old, ...mappedResults })
			)
		}
		setSearching(false)
	}

	useEffect(() => {
		setSearching(false)
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
					label={'Search users (type "my")'}
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
						<Skeleton
							key={i}
							variant={'rect'}
							width={300}
							height={100}
							className={styles.userSmall}
						/>
					)
				}
				{
					Object.values(foundUsers)
						.map(usr =>
							<UserSmall
								key={usr.id}
								user={usr}
								className={styles.userSmall}
								onPrimaryActionTaken={onPrimaryActionTaken}
							/>
						)
				}
			</Box>
		</NextOrSkipWrapper>
	)
}
