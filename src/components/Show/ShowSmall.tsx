import {
	Button,
	makeStyles
} from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import {
	useEffect,
	useRef,
	useState
} from 'react'
import {
	StrippedShowDetails
} from '../../lib/api/shows/[id]/StrippedShowDetails'

export interface ShowSmallProps {
	show: StrippedShowDetails,
	className?: string,
	onPrimaryActionTaken?: () => void,
	selected?: {
		onSelect: (show: StrippedShowDetails) => void,
		isSelected: boolean
	} | undefined,
	disableLiking?: boolean
}

const useStyles = makeStyles((theme) => ({
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7)
	},
	bold: {
		fontWeight: 'bold'
	}
}))

async function sendShowLike(showId: number, liked: boolean) {
	await fetch(
		`/api/shows/${showId}/like`,
		{
			method: liked ?
				'POST' :
				'DELETE'
		}
	)
}


export default function ShowSmall(
	{
		show,
		className,
		onPrimaryActionTaken,
		selected: selectedInfo,
		disableLiking
	}: ShowSmallProps
): JSX.Element {
	const classes = useStyles()
	console.log({ userSmall: { show } })
	const [liked, setLiked] = useState(show.liked)
	/**
	 * https://medium.com/anna-coding/the-way-to-check-if-its-the-first-time-for-useeffect-function-is-being-run-in-react-hooks-170520554067
	 * We don't want it to be sent on first render
	 */
	const firstUpdate = useRef(true)
	useEffect(() => {
		if (firstUpdate.current) {
			firstUpdate.current = false
			return
		}
		sendShowLike(show.id.id, liked).then(() => {
			console.log({
				liked,
				id: show.id.id
			})
		})
		onPrimaryActionTaken && onPrimaryActionTaken()
	}, [liked])

	let selectButton: JSX.Element | null
	if (selectedInfo) {
		selectButton = <Button
			variant={`contained`}
			color={`secondary`}
			disabled={selectedInfo.isSelected}
			onClick={() => selectedInfo.onSelect(show)}
		>
			{
				selectedInfo.isSelected ? `Selected` : `Select`
			}
		</Button>
	}
	let likeButton: JSX.Element | null
	if (!disableLiking) {
		likeButton = <Button
			variant={!liked ? 'contained' : 'outlined'}
			color={!liked ? 'primary' : 'secondary'}
			onClick={() => setLiked(liked => !liked)}
		>
			{
				liked ? 'Unlike' : 'Like'
			}
		</Button>
	}

	return (
		<Card
			className={className}
			style={{ display: `inline-block` }}
		>
			<CardContent>
				<img
					alt={`${show.name}'s poster`}
					src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
				/>
				<Typography className={classes.bold}>
					{show.name}
				</Typography>
				{' '}
				<Typography>
					({show.first_air_date.substring(0, 4)})
				</Typography>
			</CardContent>
			<CardActions>
				{
					likeButton
				}
				{
					selectButton
				}
			</CardActions>
		</Card>
	)
}