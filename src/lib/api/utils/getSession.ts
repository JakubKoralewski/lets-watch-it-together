import { Session } from 'next-auth'
import {
	getSession as getSessionNextAuth,
	useSession as useSessionNextAuth
} from 'next-auth/client'

export type SessionWithId = Session & {user: {id: number}}

export async function getSession(
	param?: Parameters<(typeof getSessionNextAuth)>[0]
): Promise<SessionWithId> {
	return await getSessionNextAuth(param) as any as Promise<SessionWithId>
}

export function useSession():
	[SessionWithId | null | undefined, boolean]
{
	const [session, loading] =
		useSessionNextAuth() as any as [SessionWithId | null | undefined, boolean]
	return [session, loading]
}