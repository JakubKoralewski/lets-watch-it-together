import { Session } from 'next-auth'
import {
	getSession as getSessionNextAuth,
	useSession as useSessionNextAuth
} from 'next-auth/client'

/** NextAuth's client with the added user's id. */
export type SessionWithId = Session & {user: {id: number}}

/**
 * Server code.
 */
export async function getSession(
	param?: Parameters<(typeof getSessionNextAuth)>[0]
): Promise<SessionWithId> {
	return await getSessionNextAuth(param) as any as Promise<SessionWithId>
}

/**
 * Client code.
 */
export function useSession():
	[SessionWithId | null | undefined, boolean]
{
	const [session, loading] =
		useSessionNextAuth() as any as [SessionWithId | null | undefined, boolean]
	return [session, loading]
}