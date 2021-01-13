import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core'
import { useRouter } from 'next/router'
import Protected from '../../../../components/Protected'
import Layout from '../../../../components/Layout'
import theme from '../../../../theme'
import { GetServerSideProps } from 'next'
import { getUserDetails } from '../../../../lib/api/users/[id]/getUserDetails'
import { getSession } from '../../../../lib/api/utils/getSession'
import UserDetailsView from '../../../../components/User/UserDetailsView'
import { UserDetails } from '../../../../lib/api/users/UserDetails'
import PreviewShowsInCommon, { PreviewShowsInCommonProps } from '../../../../components/User/PreviewShowsInCommon'
import { createLogger, LoggerTypes } from '../../../../lib/logger'
import { useEffect, useState } from 'react'
import { StrippedShowDetails } from '../../../../lib/api/shows/[id]/StrippedShowDetails'
import { TmdbId } from '../../../../lib/tmdb/api/id'
import ShowSmall from '../../../../components/Show/ShowSmall'
import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
	MuiPickersUtilsProvider,
	KeyboardTimePicker,
	KeyboardDatePicker, KeyboardDateTimePicker
} from '@material-ui/pickers'

export type NewMeetingWithUserProps = {
	user: UserDetails
}

const useStyles = makeStyles({
	create: {
		margin: theme.spacing(5)
	}
})

// Promise<{props: NewMeetingWithUserProps | undefined}>
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
			//TODO: use the redirect key in return value of serversideprops
			// https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
			context.res.setHeader('Location', '/app')
			context.res.statusCode = 302
			context.res.end()
			return { props: undefined }
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
	const selectedPropsForShowsInCommon: PreviewShowsInCommonProps['selected'] = {
		isSelected,
		onOneSelected: onSelect
	}

	// ----- date picker
	// https://material-ui.com/components/pickers/
	
	const [selectedDateTime, setSelectedDateTime] =
		React.useState<Date | null>(
			null
		);

	const handleDateTimeChange = (date: Date) => {
		console.log({time: date})
		setSelectedDateTime(date)
	}

	// ---- send meeting invite

	/**
	 * TODO: maybe think about putting the api implementation
	 *       and the api usage in the same place for coherence..
	 */
	const sendMeetingInvite = async (
		_: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		await fetch(`/api/user/${user.id}/meetings/new`, {method: `POST`})
	}

	let canSendMeetingInvite = false
	useEffect(() => {
		if(selectedDateTime && selectedShow) {
			canSendMeetingInvite = true
		}
	}, [selectedDateTime, selectedShow])

	return (
		<Protected>
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
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
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
											'aria-label': 'change time',
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
							onClick={canSendMeetingInvite ? sendMeetingInvite : undefined}
							disabled={!canSendMeetingInvite}
						>
							{
								canSendMeetingInvite ?
									`Send meeting invite` :
									`Select date and show`
							}
						</Button>
					</Container>
				</Container>
			</Layout>
		</Protected>
	)
}