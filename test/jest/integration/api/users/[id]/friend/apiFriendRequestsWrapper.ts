import { getTestSession, mockFetch, withSessionFetchMock } from '../../../utils/withLogin'

const mockedFetch = mockFetch()

import {
	apiAcceptFriendRequest as apiAcceptFriendRequestOriginal,
	apiCancelFriendRequest as apiCancelFriendRequestOriginal,
	apiSendFriendRequest as apiSendFriendRequestOriginal,
	apiUnfriend as apiUnfriendOriginal
} from 'lib/api/users/[id]/friend/client/friendRequestApi'
import { User } from '@prisma/client'

async function userTokenPair(
	senderGithubUsername: string,
	receiverGithubUsername: string
): Promise<[string, User]> {
	const destinationData = getTestSession(receiverGithubUsername)
	const fromData = getTestSession(senderGithubUsername)
	const [{ user: receiverUser }, { token: sendersToken }] =
		await Promise.all([destinationData, fromData])
	return [sendersToken, receiverUser]
}

export async function apiAcceptFriendRequestWrapped(
	fromGithubUsername: string,
	toGithubUsername: string
): Promise<Response> {
	const [sendersToken, receiverUser] = await userTokenPair(
		fromGithubUsername,
		toGithubUsername
	)
	const unmock = await withSessionFetchMock(mockedFetch, sendersToken)
	const response = await apiAcceptFriendRequestOriginal(receiverUser.id)
	unmock()
	return response
}

export async function apiSendFriendRequestWrapped(
	fromGithubUsername: string,
	toGithubUsername: string
): Promise<Response> {
	const [sendersToken, receiverUser] = await userTokenPair(
		fromGithubUsername,
		toGithubUsername
	)
	const unmock = await withSessionFetchMock(mockedFetch, sendersToken)
	const response = await apiSendFriendRequestOriginal(receiverUser.id)
	unmock()
	return response
}

export async function apiCancelFriendRequestWrapped(
	fromGithubUsername: string,
	toGithubUsername: string
): Promise<Response> {
	const [sendersToken, receiverUser] = await userTokenPair(
		fromGithubUsername,
		toGithubUsername
	)
	const unmock = await withSessionFetchMock(mockedFetch, sendersToken)
	const response = await apiCancelFriendRequestOriginal(receiverUser.id)
	unmock()
	return response
}
export async function apiUnfriendWrapped(
	fromGithubUsername: string,
	toGithubUsername: string
): Promise<Response> {
	const [sendersToken, receiverUser] = await userTokenPair(
		fromGithubUsername,
		toGithubUsername
	)
	const unmock = await withSessionFetchMock(mockedFetch, sendersToken)
	const response = await apiUnfriendOriginal(receiverUser.id)
	unmock()
	return response
}
