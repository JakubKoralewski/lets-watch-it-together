import { useState } from 'react'
import { ImdbMediaId, serializeId, TmdbIdSerialized } from '../../../lib/tmdb/api/id'
import { StrippedShowDetails } from '../../../lib/api/shows/[id]/StrippedShowDetails'
import { Box, Container, InputAdornment, TextField } from '@material-ui/core'
import { InsertDriveFile, MoreVert, Movie, Search } from '@material-ui/icons'
import { DropzoneArea } from 'material-ui-dropzone'
import ShowSmall from '../../Show/ShowSmall'
import { GoToNextStageProps, NextOrSkipWrapper } from './NextOrSkipWrapper'
import { useFriendsStyles } from './AddFriends'

export function AddShows(
	{
		nextStage,
		currentStage,
		maxStage,
		prevStage
	}: GoToNextStageProps
): JSX.Element {
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
		// eslint-disable-next-line react/jsx-no-undef
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