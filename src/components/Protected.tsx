import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import {useSession} from '../lib/api/utils/getSession'

export default function Protected(
	{
		children,
	}: PropsWithChildren<Record<never, never>>
): JSX.Element | null {
	const router = useRouter()
	const [session, loading] = useSession()

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
