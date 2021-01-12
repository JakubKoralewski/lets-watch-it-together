import { Session } from 'next-auth'
import {getSession as getSessionNextAuth} from 'next-auth/client'

export type SessionWithId = Session & {user: {id: number}}

export async function getSession(
	param?: Parameters<(typeof getSessionNextAuth)>[0]
): Promise<SessionWithId> {
	return await getSessionNextAuth(param) as any as Promise<SessionWithId>
}