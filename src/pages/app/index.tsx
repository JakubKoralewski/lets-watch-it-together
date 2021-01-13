// import { useSession } from 'next-auth/client'
import Protected from '../../components/Protected'
import Layout from '../../components/Layout'
import { WelcomeInner } from './welcome'
import { useState } from 'react'

export default function App(): JSX.Element {
	const [finished, setFinished] = useState(false)
	return (
		<Protected>
			<Layout>
				{
					!finished ?
						<WelcomeInner
							onFinish={() => setFinished(true)}
						/> :
						<>
							this is a work in progress wait till we add more stuff pls
						</>
				}
			</Layout>
		</Protected>
	)
}
