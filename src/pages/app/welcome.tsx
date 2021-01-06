import Protected from '../../components/Protected'
import { PropsWithChildren, useEffect, useState } from 'react'
import { DropzoneArea } from 'material-ui-dropzone'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import {
	Box,
	Button,
	Container,
	TextField,
	InputAdornment, makeStyles
} from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import {
	AccountCircle,
	InsertDriveFile,
	Search,
	MoreVert,
	Movie
} from '@material-ui/icons'
import useDebounced from '../../lib/utils/useDebounced'
import { UserPublic, UserPublicSearchResult } from '../../lib/UserPublic'
import UserSmall from '../../components/User/UserSmall'
import { StrippedShowDetails } from 'lib/api/shows/[id]/StrippedShowDetails'
import { ImdbMediaId, serializeId, TmdbIdSerialized } from '../../lib/tmdb/api/id'
import ShowSmall from '../../components/Show/ShowSmall'

enum Stages {
	AddFriends,
	AddShows,
	Finished,
}

interface GoToNextStageProps {
	nextStage(): void,

	canGoForward?: boolean,
	currentStage: number,
	maxStage: number,

	prevStage(): void
}

/**
 * TODO: https://material-ui.com/components/steppers/
 */
function NextOrSkipWrapper(
	{
		nextStage,
		children,
		canGoForward,
		currentStage,
		prevStage
	}: PropsWithChildren<GoToNextStageProps>
) {
	const canGoBack = currentStage >= 1

	return (
		<Container>
			<div>{children}</div>
			<Button
				color="primary"
				disabled={!canGoBack}
				onClick={canGoBack ? prevStage : undefined}
			>
				BACK
			</Button>
			<Button
				variant="contained"
				color="primary"
				disabled={!canGoForward}
				onClick={canGoForward ? nextStage : undefined}
			>
				NEXT
			</Button>
			<Button
				onClick={nextStage}
				color="secondary"
			>
				SKIP
			</Button>
		</Container>
	)
}

const useFriendsStyles = makeStyles((theme) => ({
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

function AddFriends(
	{
		nextStage,
		currentStage,
		maxStage,
		prevStage
	}: GoToNextStageProps
) {
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

function AddShows(
	{
		nextStage,
		currentStage,
		maxStage,
		prevStage
	}: GoToNextStageProps
) {
	const styles = useFriendsStyles()

	const [shows, setShows] = useState<Record<TmdbIdSerialized,
		StrippedShowDetails>>({})

	const onChangeDropzone = async (files: File[]) => {
		const imdbIds: ImdbMediaId[] = (
			await Promise.all(
				files.map(async (file) => {
					const text = await file.text()
					const lines = text.split('\n')
					if (lines.length < 2) {
						return Error('No shows in your CSV')
					}
					const firstLine = lines[0]
					const index = firstLine
						.split(',')
						.findIndex((val) => val === 'Const')
					if (index === -1) {
						return Error('Your CSV is invalid')
					}
					/* IMDb ids */
					return lines
						.slice(1)
						.map((line): ImdbMediaId => {
							const properties = line.split(',')
							/* TODO: maybe check if starts with `tt` */
							return properties[index] as ImdbMediaId
						})
						.filter((x) => Boolean(x))
				})
			)
		)
			.flatMap<ImdbMediaId>(x => {
				if ('message' in x) {
					/*TODO: maybe display error to user in snackbar */
					console.error(x)
				} else {
					return x as ImdbMediaId[]
				}
			})
			.filter((x) => Boolean(x)) as ImdbMediaId[]

		console.log('onchangedropzone', files, imdbIds)
		if (imdbIds.length > 0) {
			const response = await fetch('/api/shows?convert=1&small=1', {
				method: 'POST',
				body: JSON.stringify({
					imdbIds
				})
			})
			const json: StrippedShowDetails[] = await response.json()
			const showMap: Record<TmdbIdSerialized, StrippedShowDetails> = {}
			json.forEach(show => {
				const serialized = serializeId(show.id)
				showMap[serialized] = show
			})
			setShows(old => ({ ...old, ...showMap }))
			console.log({ json })
		}
	}
	const onShowLiked = () => 0

	return (
		<NextOrSkipWrapper
			nextStage={nextStage}
			currentStage={currentStage}
			maxStage={maxStage}
			prevStage={prevStage}
		>
			<Box>Add Shows</Box>
			<Box>
				<Container>
					<details>
						<summary className={styles.clickable}>
							To create an IMDb list:
						</summary>
						<ol>
							<li>Sign up on IMDb</li>
							<li>Click on your profile</li>
							<li>Click "Your lists"</li>
							<li>Click "CREATE A NEW LIST"</li>
							<li>Give it a name and description</li>
							<li>Click "CREATE"</li>
							<li>
								Find and add shows with "Add a movie or TV show to
								this list:"
							</li>
							<li>
								Once you have a list such as{' '}
								<a
									href={'https://www.imdb.com/list/ls082166845'}
									target="_blank"
									rel="noreferrer"
								>
									this one
								</a>{' '}
								click the <MoreVert /> icon
							</li>
							<li>Click "Export"</li>
							<li>Upload the CSV with your liked shows below</li>
						</ol>
						<DropzoneArea
							Icon={InsertDriveFile as any}
							filesLimit={1}
							onChange={onChangeDropzone}
							dropzoneText={'Drag and drop an IMDb CSV file'}
						/>
					</details>

					<TextField
						id="outlined-basic"
						label="Search shows"
						title={'Not implemented yet 🤪'}
						disabled={true}
						variant="outlined"
						// onChange={
						// 	(e) => debouncedSetInput(e.target.value.trim())
						// }
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Movie />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<Search
										className={styles.clickable}
										// onClick={
										// 	() => search(searchString)
										// }
									/>
								</InputAdornment>
							)
						}}
					/>
				</Container>
				<Box className={styles.usersContainer}>
					{
						Object.keys(shows).map(id =>
							<ShowSmall
								className={styles.userSmall}
								key={id}
								show={shows[id]}
								onPrimaryActionTaken={onShowLiked}
							/>
						)
					}
				</Box>
			</Box>
		</NextOrSkipWrapper>
	)
}

function Finished() {
	return <>{'That\'s all! Have fun! You are being redirected.'}</>
}

const stagesMap = {
	[Stages.AddFriends]: AddFriends,
	[Stages.AddShows]: AddShows,
	[Stages.Finished]: Finished
}

export function WelcomeInner({onFinish}: {onFinish: () => void}): JSX.Element {
	const [stage, setStage] = useState<Stages>(0)

	const goToNextStage = () =>
		setStage((x) => Math.min(x + 1, Stages.Finished))
	const goToPrevStage = () =>
		setStage((x) => Math.max(x - 1, Stages.AddFriends))
	const CurrentComponent = stagesMap[stage]

	useEffect(() => {
		if (stage === Stages.Finished) {
			onFinish()
		}
	}, [stage])

	return (
		<>
			{
				<CurrentComponent
					nextStage={goToNextStage}
					currentStage={stage}
					maxStage={Stages.Finished}
					prevStage={goToPrevStage}
				/>
			}
		</>
	)
}

export default function Welcome(): JSX.Element {
	const router = useRouter()
	const onFinish = () => {
		setTimeout(() => {
			router.push('/app')
		}, 1000)
	}
	return (
		<Protected>
			<Layout>
				<WelcomeInner onFinish={onFinish} />
			</Layout>
		</Protected>
	)
}
