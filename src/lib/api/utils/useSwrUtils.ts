import { UserDetails } from '../users/UserDetails'

export type UseEntityReturnType<
	EntityName extends string,
	Entity extends unknown,
	Err extends Error=Error
> = {
	isLoading: boolean;
	error?: Err | undefined;
} & Record<EntityName, Entity | undefined>

export async function getFetcher(apiRoute: string): Promise<UserDetails> {
	return await fetch(apiRoute, {method: "GET"}).then(res => res.json())
}

// import {User} from '@prisma/client'
// const testType = {
// 	user: undefined,
// 	isLoading: true,
// 	error: undefined
// } as UseEntityHelper<'user', User>