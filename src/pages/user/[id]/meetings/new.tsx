import { Box, makeStyles, Typography } from '@material-ui/core'
import { useRouter } from 'next/router'
import Protected from '../../../../components/Protected'
import Layout from '../../../../components/Layout'
import theme from '../../../../theme'
import { GetServerSideProps } from 'next'
import { getUserDetails } from '../../../../lib/api/users/[id]/getUserDetails'
import { getSession } from '../../../../lib/api/utils/getSession'
import UserDetailsView from '../../../../components/User/UserDetailsView'
import { UserDetails } from '../../../../lib/api/users/UserDetails'
import PreviewShowsInCommon from '../../../../components/User/PreviewShowsInCommon'
import { createLogger, LoggerTypes } from '../../../../lib/logger'

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
					/>
				</Box>
			</Layout>
		</Protected>
	)
}