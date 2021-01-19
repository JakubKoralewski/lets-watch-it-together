import prisma from '../../../../../src/lib/prisma/prisma'
import nodeFetch, {RequestInit, Response} from 'node-fetch'
import {User} from '@prisma/client'

function toCookie(obj: unknown & Record<string, string>) {
	return {
		'Cookie': Object.entries(obj).flatMap(([k, v]) => {
			return [k, '=', v, ';']
		}).concat(['domain=.;path=/;']).join('')
	}
}

export type MockedFetch =
	jest.Mock<Promise<Response>, [url: string, options: RequestInit]>

export function mockFetch(): MockedFetch {
	// default implementation
	const fetch = jest.fn(
		(url: string, options: RequestInit) => nodeFetch(url, options)
	)
	jest.setMock('node-fetch', fetch)
	return fetch
}

export async function getTestSession(
	githubUsername: string
): Promise<{user: User, token: string}> {
	const user = await prisma.user.findFirst({
		where: {
			name: githubUsername
		}
	})
	if (!user) {
		throw Error('Given user does not exist')
	}
	const sessionOfUser = await prisma.session.findFirst({
		where: {
			userId: user.id
		},
		orderBy: {
			createdAt: 'desc'
		}
	})
	if (!sessionOfUser) {
		throw Error('Given user exists but does not have a session in db')
	}
	return {
		user,
		token: sessionOfUser.sessionToken
	}
}

export async function withSessionFetchMock(
	fetchFunc: MockedFetch,
	sessionToken: string
): Promise<() => void> {
	const cookiesRaw = {
		'__Secure-next-auth.session-token': sessionToken
	}

	const cookiesSerialized = toCookie(cookiesRaw)

	fetchFunc.mockImplementationOnce(
		(url: string, options: RequestInit) => {
			let localApiCall = false
			if(!(url.startsWith('http'))) {
				localApiCall = true
			}
			return nodeFetch(
				url,
				{
					headers: localApiCall && cookiesSerialized,
					...options
				}
			)
		}
	)
	return () => 0
}