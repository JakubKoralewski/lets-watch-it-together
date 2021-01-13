import {
	Box,
	Button,
	Container,
	Grid, IconButton,
	makeStyles, Snackbar,
	Typography
} from '@material-ui/core'
import { useRouter } from 'next/router'
import Protected from 'components/Protected'
import Layout from 'components/Layout'
import theme from 'theme'
import { GetServerSideProps } from 'next'
import { getUserDetails } from 'lib/api/users/[id]/getUserDetails'
import { getSession } from 'lib/api/utils/getSession'
import UserDetailsView from 'components/User/UserDetailsView'
import { UserDetails } from 'lib/api/users/UserDetails'
import PreviewShowsInCommon, {
	PreviewShowsInCommonProps
} from 'components/User/PreviewShowsInCommon'
import {
	createLogger,
	LoggerTypes
} from 'lib/logger'
import {
	useState
} from 'react'
import {
	StrippedShowDetails
} from 'lib/api/shows/[id]/StrippedShowDetails'
import {
	TmdbId
} from 'lib/tmdb/api/id'
import ShowSmall from 'components/Show/ShowSmall'
import 'date-fns'
import React from 'react'
import DateFnsUtils from '@date-io/date-fns'
import {
	MuiPickersUtilsProvider,
	KeyboardDateTimePicker
} from '@material-ui/pickers'
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { Alert } from '@material-ui/lab'

function SlideTransition(props: TransitionProps) {
	return <Slide {...props} direction="up" />;
}

export type NewMeetingWithUserProps = {
	user: UserDetails
}

const useStyles = makeStyles({
	create: {
		margin: theme.spacing(5)
	}
})

export const getServerSideProps: GetServerSideProps =
	async (context) => {
		const logger = createLogger(LoggerTypes.NewMeetingGetServerSideProps)
		let userId: number = undefined
		try {
			userId = parseInt(context.query.id as string)
			if (userId < 0) {
				userId = -1
			}
		} catch (e) {
			userId = -1
		}
		const session = await getSession(context)
		if (!session || userId === -1) {
			return {
				props: undefined ,
				redirect: {
					statusCode: 302,
					destination: `/app`
				}
			}
		}
		const user = await getUserDetails(
			userId,
			session.user.id,
			false
		)
		logger.info({
			user
		})

		return {
			props: {
				user
			}
		}
	}


export default function NewMeetingWithUser(
	{
		user
	}: NewMeetingWithUserProps
):
	JSX.Element {
	const styles = useStyles()
	const router = useRouter()
	console.log({ router })

	// ----- create meeting with user title
	let userTitle = null
	if (user) {
		userTitle = <>
			<Typography
				variant={`body1`}
				color={`textSecondary`}
				display={`inline`}
			>
				{` with `}
			</Typography>
			<Typography
				variant={`h5`}
				color={`textPrimary`}
				display={`inline`}
			>
				{
					user.name
				}
			</Typography>
		</>
	}

	// ---- selected show

	const [selectedShow, setSelectedShow] =
		useState<StrippedShowDetails | undefined>(
			undefined
		)

	const isSelected =
		(showId: TmdbId) =>
			selectedShow && selectedShow.id.id === showId.id

	const onSelect = (show: StrippedShowDetails) => {
		setSelectedShow(show)
	}
	const selectedPropsForShowsInCommon:
		PreviewShowsInCommonProps['selected'] =
		{
			isSelected,
			onOneSelected: onSelect
		}

	// ----- date picker
	// https://material-ui.com/components/pickers/

	const [selectedDateTime, setSelectedDateTime] =
		React.useState<Date | null>(
			null
		)

	const handleDateTimeChange = (date: Date) => {
		console.log({ time: date })
		setSelectedDateTime(date)
	}

	// ---- send meeting invite
	const [meetingInviteSent, setMeetingInviteSent] = useState(false)

	/**
	 * TODO: maybe think about putting the api implementation
	 *       and the api usage in the same place for coherence..
	 */
	const sendMeetingInvite = async (
		_: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		try {
			await fetch(
				`/api/user/${user.id}/meetings/new`,
				{
					method: `POST`
				}
			)
		} catch(e) {
			console.error(e)
		}
		setMeetingInviteSent(true)
	}
	const canSendMeetingInvite = !!selectedDateTime && !!selectedShow

	// ---- snackbar

	const handleSnackbarClose = (
		event: React.SyntheticEvent | React.MouseEvent,
		reason?: string
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setMeetingInviteSent(false);
	};

	return (
		<Protected>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				open={meetingInviteSent}
				autoHideDuration={6000}
				onClose={handleSnackbarClose}
				TransitionComponent={SlideTransition}
			>
				<Alert severity={`success`}>
					Meeting invite sent
					<React.Fragment>
						<Button
							color="secondary"
							size="small"
							onClick={handleSnackbarClose}
						>
							UNDO
						</Button>
						<IconButton
							size="small"
							aria-label="close"
							color="inherit"
							onClick={handleSnackbarClose}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</React.Fragment>
				</Alert>
			</Snackbar>
			<Layout>
				<Box
					className={styles.create}
				>
					<Typography
						variant={`h5`}
						display={`inline`}
					>
						Create new meeting
					</Typography>
					{
						userTitle
					}
				</Box>
				<Box>
					{
						<UserDetailsView
							user={user}
						/>
					}
				</Box>
				<Box>
					<PreviewShowsInCommon
						shows={user.liked}
						selected={selectedPropsForShowsInCommon}
					/>
				</Box>
				<Container>
					<Grid
						container
						direction={`row`}
						justify={`center`}
						alignItems={`flex-start`}
					>
						<Grid>
							<Typography>
								Selected show
							</Typography>
							{
								selectedShow ?
									<ShowSmall
										show={selectedShow}
										disableLiking={true}
									/> : <>Select a show</>
							}
						</Grid>
						<Grid>
							<Typography>
								Selected date
							</Typography>
							<MuiPickersUtilsProvider
								utils={DateFnsUtils}
							>
								<Grid
									container
									direction={`column`}
									justify="space-around"
								>
									<KeyboardDateTimePicker
										margin="normal"
										id="time-picker"
										label="Time picker"
										disablePast={true}
										emptyLabel={`Pick a date`}
										value={selectedDateTime}
										onChange={handleDateTimeChange}
										KeyboardButtonProps={{
											'aria-label': 'change time'
										}}
									/>
								</Grid>
							</MuiPickersUtilsProvider>
						</Grid>
					</Grid>
					<Container>
						<Button
							variant={`contained`}
							color={`primary`}
							onClick={
								canSendMeetingInvite ?
									sendMeetingInvite :
									undefined
							}
							disabled={!canSendMeetingInvite}
						>
							{
								!selectedShow && !selectedDateTime ?
									`Select date and show` :
									selectedShow && !selectedDateTime ?
										`Select date` :
										!selectedShow && selectedDateTime ?
											`Select show` :
											`Send meeting invite`
							}
						</Button>
					</Container>
				</Container>
			</Layout>
		</Protected>
	)
}