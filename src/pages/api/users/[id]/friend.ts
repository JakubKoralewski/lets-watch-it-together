import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { constants } from 'http2'
import prisma from 'lib/prisma/prisma'
import { FriendshipType, User, Prisma } from '@prisma/client'

const {
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_UNAUTHORIZED,
	HTTP2_METHOD_POST,
	HTTP_STATUS_METHOD_NOT_ALLOWED,
	HTTP2_METHOD_DELETE,
	HTTP2_METHOD_PATCH
} = constants

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getSession({ req })
	console.log('friend user', req.query.id)
	if (session) {
		const userId: number = session.user['id']
		// Signed in
		let friendId: number
		try {
			friendId = parseInt(req.query.id as string)
		} catch {
			res.status(HTTP_STATUS_BAD_REQUEST)
			res.end()
			return
		}
		if (friendId === session.user['id']) {
			res.status(HTTP_STATUS_BAD_REQUEST)
			res.end()
			return
		}
		const getPotentialFriendQuery = {
			where: {
				id: friendId
			},
			include: {
				friendRequestsSent: {
					where: {
						requesteeId: userId
					}
				},
				friendRequestsReceived: {
					where: {
						requesterId: userId
					}
				}
			}
		} as const

		let potentialFriend:
			Prisma.UserGetPayload<typeof getPotentialFriendQuery>

		switch (req.method) {
			case HTTP2_METHOD_PATCH:
			case HTTP2_METHOD_POST:
			case HTTP2_METHOD_DELETE:
				potentialFriend = await prisma.user.findUnique(
					getPotentialFriendQuery
				)
				if (!potentialFriend) {
					res.status(HTTP_STATUS_BAD_REQUEST)
					res.json({ message: `provided id ${friendId} doesn't exist` })
					res.end()
					return
				}
				break
			default: {
				console.error('unsupported method', req.method)
				res.status(HTTP_STATUS_METHOD_NOT_ALLOWED)
				res.end()
				return
			}
		}

		switch (req.method) {
			case HTTP2_METHOD_PATCH:
			case HTTP2_METHOD_POST: {
				const isAccept = Boolean(req.method === HTTP2_METHOD_PATCH)
				if (isAccept) {
					console.log('accepting friend request')
				} else {
					console.log('sending friend request')
				}

				if (potentialFriend.friendRequestsSent.length === 1) {
					// user has send friend request to you
					// and you talk to me to add that user
					// so I assume you want to accept the friend request
					if (!isAccept) {
						console.error(
							'assume accept, but isAccept was false',
							JSON.stringify(req.query)
						)
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.json({ message: `accept not provided` })
						res.end()
						return
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
													requesteeId: userId
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
						res.end()
						return
					}
				} else if (potentialFriend.friendRequestsSent.length > 1) {
					//database corrupt
				}

				if (potentialFriend.friendRequestsReceived.length === 1) {
					res.status(HTTP_STATUS_BAD_REQUEST)
					// you have already sent a friend request
					// and you talk to me to add that friend again, what do?
					if (isAccept) {
						// well that just doesn't make sense
						console.error('sent accept while you never got a friend request')
						res.json({ message: `get a friend first to accept` })
					} else {
						res.json({ message: `cant add friend again` })
					}
					res.end()
					return
				} else if (potentialFriend.friendRequestsReceived.length > 1) {
					//database corrupt
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
											requesteeId: userId,
											requesterId: friendId
										}
									},
									create: {
										friendshipType:
											FriendshipType.REQUESTED,
										requester: {
											connect: {
												id: userId
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
				break
			}
			case HTTP2_METHOD_DELETE: {
				const isCancel = Boolean(req.query['cancel'])
				if (isCancel) {
					console.log('cancelling friend request')
					if (potentialFriend.friendRequestsReceived.length === 0) {
						// only one check because you can only cancel the request
						// if you made it so no point in checking both relations
						res.status(HTTP_STATUS_BAD_REQUEST)
						res.json(
							{
								message:
									`can't cancel friend request if it was never made`
							}
						)
						res.end()
						return
					}
					await prisma.user.update({
						where: {
							id: friendId
						},
						data: {
							friendRequestsReceived: {
								update: {
									where: {
										requesterId_requesteeId: {
											requesteeId: friendId,
											requesterId: userId
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
				} else {
					console.log('unfriending friend')
					// here we are unfriending someone and we don't know if
					// you sent the request or the friend sent it so we need
					// to check both relations now
					if (potentialFriend.friendRequestsReceived.length === 1) {
						await prisma.user.update({
							where: {
								id: friendId
							},
							data: {
								friendRequestsReceived: {
									update: {
										where: {
											requesterId_requesteeId: {
												requesteeId: friendId,
												requesterId: userId
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
					} else if (
						potentialFriend.friendRequestsSent.length === 1
					) {
						await prisma.user.update({
							where: {
								id: friendId
							},
							data: {
								friendRequestsReceived: {
									update: {
										where: {
											requesterId_requesteeId: {
												requesteeId: userId,
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
					}
				}

				break
			}
			default: {
				// already checked when getting potential friend
				// should never happen
				console.error('fatal 275 !!!!!!!!!!!!!!!!!!!')
			}
		}
	} else {
		// Not Signed in
		res.status(HTTP_STATUS_UNAUTHORIZED)
	}
	res.end()
}
