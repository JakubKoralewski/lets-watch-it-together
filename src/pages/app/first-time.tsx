import { getSession, useSession } from 'next-auth/client'
import Protected from '../../components/Protected'

export default function FirstTime() {
	const [session, loading] = useSession()

	return (
		<Protected>
			<h1>Protected Page</h1>
			<p>You can view this page because you are signed in.</p>
		</Protected>
	)
}
