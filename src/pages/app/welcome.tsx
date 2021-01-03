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
	InputAdornment,
} from '@material-ui/core'
import {
	AccountCircle,
	InsertDriveFile,
	Search,
	MoreVert,
} from '@material-ui/icons'
import useDebouncedSearch from '../../lib/utils/useDebouncedSearch'
import { UserPublicSearchResult } from '../../lib/UserPublic'

enum Stages {
	AddFriends,
	AddShows,
	Finished,
}

interface GoToNextStageProps {
	nextStage(): void
}

function NextOrSkipWrapper({
	nextStage,
	children,
}: PropsWithChildren<GoToNextStageProps>) {
	return (
		<Container>
			<div>{children}</div>
			<Button variant="contained" color="primary" disabled>
				NEXT
			</Button>
			<Button onClick={nextStage} color="secondary">
				SKIP
			</Button>
		</Container>
	)
}

function AddFriends({ nextStage }: GoToNextStageProps) {
	const search = async (
		searchString: string
	): Promise<UserPublicSearchResult[]> => {
		const response = await fetch(
			`/api/search/users?q=${encodeURI(searchString)}`
		)
		return response.json().catch((reason) => {
			console.error('response error', reason)
		})
	}
	const handler = useDebouncedSearch(search)
	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		handler(e.target.value)
	}

	return (
		<NextOrSkipWrapper nextStage={nextStage}>
			<Box>Add Friends</Box>
			<Box>
				<TextField
					id="outlined-basic"
					label="Search users"
					variant="outlined"
					onChange={onInput}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccountCircle />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<Search />
							</InputAdornment>
						),
					}}
				/>
			</Box>
		</NextOrSkipWrapper>
	)
}

function AddShows({ nextStage }: GoToNextStageProps) {
	const onChangeDropzone = async (files: File[]) => {
		const imdbIds = (
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
						.map((line) => {
							const properties = line.split(',')
							/* TODO: maybe check if starts with `tt` */
							return properties[index]
						})
						.filter((x) => Boolean(x))
				})
			)
		)
			.flatMap((x) => {
				if ('message' in x) {
					/*TODO: maybe display error to user in snackbar */
					console.error(x)
				} else {
					return x
				}
			})
			.filter((x) => Boolean(x))

		console.log('onchangedropzone', files, imdbIds)
		if(imdbIds.length > 0) {
			const response = await fetch('/api/shows', {
				method: 'POST',
				body: JSON.stringify({
					imdbIds,
				}),
			})
			const json: number[] = await response.json()
			console.log({json})
		}
	}

	return (
		<NextOrSkipWrapper nextStage={nextStage}>
			<Box>Add Shows</Box>
			<Box>
				<Container>
					<details>
						<summary>To create an IMDb list:</summary>
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
					</details>
				</Container>
				<DropzoneArea
					Icon={InsertDriveFile as any}
					filesLimit={1}
					onChange={onChangeDropzone}
					dropzoneText={'Drag and drop an IMDb CSV file'}
				/>
			</Box>
		</NextOrSkipWrapper>
	)
}
function Finished() {
	return <>{"That's all! Have fun! You are being redirected."}</>
}

const stagesMap = {
	[Stages.AddFriends]: AddFriends,
	[Stages.AddShows]: AddShows,
	[Stages.Finished]: Finished,
}

export default function Welcome() {
	const [stage, setStage] = useState<Stages>(0)
	const router = useRouter()

	const goToNextStage = () =>
		setStage((x) => Math.min(x + 1, Stages.Finished))
	const CurrentComponent = stagesMap[stage]

	useEffect(() => {
		if (stage === Stages.Finished) {
			setTimeout(() => {
				router.push('/app')
			}, 1000)
		}
	}, [stage])

	return (
		<Protected>
			<Layout>
				{<CurrentComponent nextStage={goToNextStage} />}
			</Layout>
		</Protected>
	)
}
