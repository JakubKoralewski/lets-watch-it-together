import { getSession, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

export default function Protected({children}: PropsWithChildren<{}>) {
	const [session, loading] = useSession()
	const router = useRouter()

	if (typeof window !== 'undefined' && loading) return null

	if (!session) {
		if(process.browser) {
			void router.push('/?error=access-denied')
		}
		return <p>Access Denied</p>
	}

	return (
		<>
			{children}
		</>
	)
}

export async function getServerSideProps(context) {
	const session = await getSession(context)
	return {
		props: { session }
	}
}