// import { useSession } from 'next-auth/client'
import Protected from '../../components/Protected'
import Layout from '../../components/Layout'

export default function App() {
	// const [session, loading] = useSession()
	return (
		<Protected>
			<Layout>
				<h1>Protected Page</h1>
				<p>You can view this page because you are signed in.</p>
			</Layout>
		</Protected>
	)
}
