import { UserPublicSearchResult } from '../../lib/UserPublic'
import { AccountBox } from '@material-ui/icons'
import { Avatar, Box, Button, makeStyles, PropTypes } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { FriendshipTypeResponse } from '../../lib/api/user/[id]/FriendshipType'
import assertUnreachable from '../../lib/utils/assertUnreachable'
import { useState } from 'react'
import { StrippedShowDetails } from '../../lib/api/shows/[id]/StrippedShowDetails'

export interface ShowSmallProps {
	show: StrippedShowDetails,
	className?: string,
	onPrimaryActionTaken: () => void
}

const useStyles = makeStyles((theme) => ({
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7)
	},
	bold: {
		fontWeight: "bold"
	}
}))


export default function ShowSmall(
	{
		show,
		className,
		onPrimaryActionTaken
	}: ShowSmallProps
) {
	const classes = useStyles()
	console.log({userSmall: {show}})
	// const onClickWithPrimaryAction = async () => {
	// 	await onClick()
	// 	onPrimaryActionTaken()
	// }
	return (
		<Card className={className}>
			<CardContent>
				<img src={`https://image.tmdb.org/t/p/w200${show.poster_path}`} />
				<Typography className={classes.bold}>
					{show.name}
				</Typography>
				{' '}
				<Typography>
					({show.first_air_date.substring(0, 4)})
				</Typography>
			</CardContent>
			<CardActions>
				<Button>
					Like
				</Button>

				{/*{*/}
				{/*	buttonType(*/}
				{/*		buttonText,*/}
				{/*		onClickWithPrimaryAction,*/}
				{/*		buttonColor*/}
				{/*	)*/}
				{/*}*/}
			</CardActions>
		</Card>
	)
}