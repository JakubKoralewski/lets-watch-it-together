import { FriendshipType, Prisma } from '@prisma/client'
import prisma from 'lib/prisma/prisma'
import {User} from '@prisma/client'
import assertUnreachable from '../../../utils/assertUnreachable'
import { HTTPMethod } from 'lib/utils/HTTPMethod'

export enum AddFriendErrorType {
	BadFriendId,
	FriendAndUserAreTheSameId,
	FriendDoesntExist,

	/** Accept false */
	TriedToAcceptButThereWasNothingToAccept,
	/** Accept false */
	CantAcceptTwice,
	/** Accept true */
	AcceptWasNotProvidedButFriendRequestAlreadyExists,

	InvalidMethod,

	/** Cancel true */
	CantCancelAFriendRequestThatYouNeverMade,

	DbCorrupt
}

export class AddFriendError extends Error {
	constructor(
		public addFriendErrorType: AddFriendErrorType,
		public mapMessage?: unknown,
	) {
		super(JSON.stringify(mapMessage))
	}
}

export function isAddFriendError(err: unknown):
	err is AddFriendError
{
	return (
		err instanceof AddFriendError ||
		(
			typeof err === 'object' && ('addFriendErrorType' in err)
		)
	)
}

export interface AddFriendOptionalArguments {
	isCancel?: boolean,
	method: HTTPMethod
}
/**
 * Assumes session validation, authentication were already done!
 */
export async function addFriend(
	yourId: number,
	potentialFriendId: string | number,
	{
		isCancel=false,
		method=HTTPMethod.POST
	}: AddFriendOptionalArguments
): Promise<User> {
	let friendId: number
	if(typeof potentialFriendId === 'string') {
		try {
			friendId = parseInt(potentialFriendId)
		} catch (e) {
			throw new AddFriendError(
				AddFriendErrorType.BadFriendId
			)
		}
	} else {
		friendId = potentialFriendId
	}

	if (friendId === yourId) {
		throw new AddFriendError(
			AddFriendErrorType.FriendAndUserAreTheSameId
		)
	}
	const isAccept = Boolean(method === HTTPMethod.PATCH)

	const getPotentialFriendQuery = {
		where: {
			id: friendId
		},
		include: {
			friendRequestsSent: {
				where: {
					requesteeId: yourId
				}
			},
			friendRequestsReceived: {
				where: {
					requesterId: yourId
				}
			}
		}
	} as const

	let potentialFriend:
		Prisma.UserGetPayload<typeof getPotentialFriendQuery>;

	switch (method) {
		case HTTPMethod.PATCH:
		case HTTPMethod.POST:
		case HTTPMethod.DELETE:
			potentialFriend = await prisma.user.findUnique(
				getPotentialFriendQuery
			)
			if (!potentialFriend) {
				throw new AddFriendError(
					AddFriendErrorType.FriendDoesntExist
				)
			}
			break
		default: {
			throw new AddFriendError(
				AddFriendErrorType.InvalidMethod,
				{
					method
				}
			)
		}
	}

	switch (method) {
		case HTTPMethod.PATCH:
		case HTTPMethod.POST: {
			if (isAccept) {
				console.log('accepting friend request')
			} else {
				console.log('sending friend request')
			}

			if (potentialFriend.friendRequestsSent.length === 1) {
				// user has send friend request to you
				// and you talk to me to add that user
				if (!isAccept) {
					// but if you don't say you want to accept,
					// you have a bug in your code and I won't
					// go any further
					throw new AddFriendError(
						AddFriendErrorType.AcceptWasNotProvidedButFriendRequestAlreadyExists
					)
				} else {
					// happy path to accept friend request
					const updatedUser = await prisma.user.update(
						{
							where: { id: friendId },
							data: {
								friendRequestsSent: {
									update: {
										where: {
											requesterId_requesteeId: {
												requesterId: friendId,
												requesteeId: yourId
											}
										},
										data: {
											friendshipType:
											FriendshipType.ACCEPTED,
											acceptedAt: new Date()
										}
									}
								}
							}
						}
					)
					console.log(
						'success accepting friend request',
						JSON.stringify({ updatedUser })
					)
					return
				}
			} else if (potentialFriend.friendRequestsSent.length > 1) {
				throw new AddFriendError(
					AddFriendErrorType.DbCorrupt
				)
			}

			if (potentialFriend.friendRequestsReceived.length === 1) {
				// you have already sent a friend request
				// and you talk to me to add that friend again, what do?
				if (isAccept) {
					// well that just doesn't make sense
					throw new AddFriendError(
						AddFriendErrorType.TriedToAcceptButThereWasNothingToAccept
					)
				} else {
					throw new AddFriendError(
						AddFriendErrorType.CantAcceptTwice
					)
				}
			} else if (potentialFriend.friendRequestsReceived.length > 1) {
				throw new AddFriendError(
					AddFriendErrorType.DbCorrupt
				)
			}

			// happy path to send friend request

			const updatedUser = await prisma.user.update(
				{
					where: { id: friendId },
					data: {
						friendRequestsReceived: {
							connectOrCreate: {
								where: {
									requesterId_requesteeId: {
										requesteeId: yourId,
										requesterId: friendId
									}
								},
								create: {
									friendshipType:
									FriendshipType.REQUESTED,
									requester: {
										connect: {
											id: yourId
										}
									},
									acceptedAt: isAccept ?
										new Date() :
										undefined
								}
							}
						}
					}
				}
			)
			console.log(
				'success sending friend request',
				JSON.stringify({ updatedUser })
			)
			return updatedUser
		}
		case HTTPMethod.DELETE: {
			if (isCancel) {
				console.log('cancelling friend request')
				if (potentialFriend.friendRequestsReceived.length === 0) {
					// only one check because you can only cancel the request
					// if you made it so no point in checking both relations
					throw new AddFriendError(
						AddFriendErrorType.CantCancelAFriendRequestThatYouNeverMade
					)
				}
				const updatedUser = await prisma.user.update({
					where: {
						id: friendId
					},
					data: {
						friendRequestsReceived: {
							update: {
								where: {
									requesterId_requesteeId: {
										requesteeId: friendId,
										requesterId: yourId
									}
								},
								data: {
									friendshipType:
									FriendshipType.CANCELLED,
									cancelledAt: new Date()
								}
							}
						}
					}
				})

				return updatedUser
			} else {
				console.log('unfriending friend')
				// here we are unfriending someone and we don't know if
				// you sent the request or the friend sent it so we need
				// to check both relations now
				if (potentialFriend.friendRequestsReceived.length === 1) {
					const updatedUser = await prisma.user.update({
						where: {
							id: friendId
						},
						data: {
							friendRequestsReceived: {
								update: {
									where: {
										requesterId_requesteeId: {
											requesteeId: friendId,
											requesterId: yourId
										}
									},
									data: {
										friendshipType:
										FriendshipType.
											UNFRIENDED_BY_REQUESTER,
										cancelledAt: new Date()
									}
								}
							}
						}
					})
					return updatedUser
				} else if (
					potentialFriend.friendRequestsSent.length === 1
				) {
					const updatedUser = await prisma.user.update({
						where: {
							id: friendId
						},
						data: {
							friendRequestsReceived: {
								update: {
									where: {
										requesterId_requesteeId: {
											requesteeId: yourId,
											requesterId: friendId
										}
									},
									data: {
										friendshipType:
										FriendshipType.
											UNFRIENDED_BY_REQUESTEE,
										unfriendedAt: new Date()
									}
								}
							}
						}
					})
					return updatedUser
				}
			}

			break
		}
		default: {
			assertUnreachable(method)
			// already checked when getting potential friend
			// should never happen
			console.error('fatal 275 !!!!!!!!!!!!!!!!!!!')
		}
	}
}