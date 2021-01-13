import { FriendshipType, Prisma, User } from '@prisma/client'
import prisma from 'lib/prisma/prisma'
import assertUnreachable from '../../../utils/assertUnreachable'
import { createLogger, LoggerTypes } from '../../../logger'
import { ErrorInLibWithLogging, LibErrorType } from '../../../logger/libLogger'
import { Logger } from 'pino'

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

	DbCorrupt,
	CantUnfriendSomeoneWhosNotYourFriend,
}

export class AddFriendError extends ErrorInLibWithLogging<AddFriendErrorType> {
	constructor(
		public addFriendErrorType: AddFriendErrorType,
		public parentLogger: Logger,
		public mapMessage?: unknown,
		public parentError?: Error
	) {
		super(
			{
				libErrorType: LibErrorType.AddFriend,
				innerEnum: AddFriendErrorType,
				innerErrorEnumValue: addFriendErrorType,
				libErrorMessage: JSON.stringify(mapMessage),
				parentLogger: parentLogger,
				parentError
			}
		)
	}
}

export function isAddFriendError(err: Error):
	err is AddFriendError {
	return (
		err instanceof AddFriendError ||
		(
			typeof err === 'object' && ('addFriendErrorType' in err)
		)
	)
}

export enum AddFriendActionType {
	SendFriendRequest,
	AcceptFriendRequest,
	CancelFriendRequest,
	Unfriend
}

export interface AddFriendOptionalArguments {
	action: AddFriendActionType
	// isCancel?: boolean,
	// method: HTTPMethod
}

/**
 * Assumes session validation, authentication were already done!
 */
export async function friendRequest(
	yourId: number,
	friendId: number,
	{
		action
	}: AddFriendOptionalArguments
): Promise<User> {
	const logger = createLogger(LoggerTypes.AddFriend)

	if (friendId === yourId) {
		throw new AddFriendError(
			AddFriendErrorType.FriendAndUserAreTheSameId,
			logger
		)
	}

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
		Prisma.UserGetPayload<typeof getPotentialFriendQuery> | null

	switch (action) {
		case AddFriendActionType.SendFriendRequest:
		case AddFriendActionType.AcceptFriendRequest:
		case AddFriendActionType.CancelFriendRequest:
		case AddFriendActionType.Unfriend:
			potentialFriend = await prisma.user.findUnique(
				getPotentialFriendQuery
			)
			if (!potentialFriend) {
				throw new AddFriendError(
					AddFriendErrorType.FriendDoesntExist,
					logger
				)
			}
			break
		default: {
			assertUnreachable(action)
		}
	}
	let updatedUser: User

	switch (action) {
		case AddFriendActionType.SendFriendRequest:
		case AddFriendActionType.AcceptFriendRequest: {
			const isAccept = action === AddFriendActionType.AcceptFriendRequest
			if (isAccept) {
				logger.debug('accepting friend request')
			} else {
				logger.debug('sending friend request')
			}

			if (potentialFriend.friendRequestsSent.length === 1) {
				// user has send friend request to you
				// and you talk to me to add that user
				if (!isAccept) {
					// but if you don't say you want to accept,
					// you have a bug in your code and I won't
					// go any further
					throw new AddFriendError(
						AddFriendErrorType.AcceptWasNotProvidedButFriendRequestAlreadyExists,
						logger
					)
				} else {
					// happy path to accept friend request
					updatedUser = await prisma.user.update(
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
					logger.debug(
						'success accepting friend request',
						JSON.stringify({ updatedUser })
					)
				}
			} else if (potentialFriend.friendRequestsSent.length > 1) {
				throw new AddFriendError(
					AddFriendErrorType.DbCorrupt,
					logger
				)
			}

			if (potentialFriend.friendRequestsReceived.length === 1) {
				// you have already sent a friend request
				// and you talk to me to add that friend again, what do?
				if (isAccept) {
					// well that just doesn't make sense
					throw new AddFriendError(
						AddFriendErrorType.TriedToAcceptButThereWasNothingToAccept,
						logger
					)
				} else {
					throw new AddFriendError(
						AddFriendErrorType.CantAcceptTwice,
						logger
					)
				}
			} else if (potentialFriend.friendRequestsReceived.length > 1) {
				throw new AddFriendError(
					AddFriendErrorType.DbCorrupt,
					logger
				)
			}

			// happy path to send friend request

			updatedUser = await prisma.user.update(
				{
					where: { id: friendId },
					data: {
						friendRequestsReceived: {
							connectOrCreate: {
								where: {
									requesterId_requesteeId: {
										requesteeId: friendId,
										requesterId: yourId
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
			logger.debug(
				'success sending friend request',
				JSON.stringify({ updatedUser })
			)
			break
		}
		case AddFriendActionType.CancelFriendRequest:
		case AddFriendActionType.Unfriend: {
			const isCancel = action === AddFriendActionType.CancelFriendRequest
			if (isCancel) {
				logger.debug('cancelling friend request')
				if (potentialFriend.friendRequestsReceived.length === 0) {
					// only one check because you can only cancel the request
					// if you made it so no point in checking both relations
					throw new AddFriendError(
						AddFriendErrorType.CantCancelAFriendRequestThatYouNeverMade,
						logger
					)
				}
				updatedUser = await prisma.user.update({
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

				break
			} else {
				logger.debug('unfriending friend')
				// here we are unfriending someone and we don't know if
				// you sent the request or the friend sent it so we need
				// to check both relations now
				if (potentialFriend.friendRequestsReceived.length === 1) {
					updatedUser = await prisma.user.update({
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
										FriendshipType.UNFRIENDED_BY_REQUESTER,
										cancelledAt: new Date()
									}
								}
							}
						}
					})
					break
				} else if (
					potentialFriend.friendRequestsSent.length === 1
				) {
					updatedUser = await prisma.user.update({
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
										FriendshipType.UNFRIENDED_BY_REQUESTEE,
										unfriendedAt: new Date()
									}
								}
							}
						}
					})
					break
				} else {
					throw new AddFriendError(
						AddFriendErrorType.CantUnfriendSomeoneWhosNotYourFriend,
						logger
					)
				}
			}
		}
		default: {
			assertUnreachable(action)
		}
	}
	return updatedUser
}