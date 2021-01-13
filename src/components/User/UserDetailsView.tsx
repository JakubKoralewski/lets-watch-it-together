import { UserDetails as IUserDetails } from '../../lib/api/users/UserDetails'
import UserSmall from './UserSmall'
import { Typography, Container } from '@material-ui/core'
import prettyDate from '../../lib/client/prettyDate'

export default function UserDetailsView(
	{ user }: { user: IUserDetails }
): JSX.Element {
	let additionalFriendsContent: JSX.Element
	if (user.friends) {
		additionalFriendsContent =
			<Typography>
				<strong>Friends since </strong>
				{
					` ` + prettyDate(new Date(user.friendsAt))
				}
			</Typography>
	}
	const additionalInformation = <Container>
		<Typography>
			<strong>User since </strong>
			{
				` ` +
				prettyDate(new Date(user.registeredAt))
			}
			{
				additionalFriendsContent
			}
		</Typography>
	</Container>
	return <UserSmall
		user={user}
		additionalContent={additionalInformation}
	/>
}