require('dotenv').config({ debug: true })

if (require.main === module) {
	const fileIndex = process.argv.findIndex(
		(val) => val.endsWith('initiateDb.ts')
	)
	const optionalArguments = process.argv.slice(fileIndex + 1)
	console.log({ optionalArguments })
	let dbUrl: string
	if (optionalArguments.length >= 1) {
		if (optionalArguments.length === 1) {
			dbUrl = optionalArguments[0].trim()
			if (!dbUrl.startsWith('postgres://')) {
				throw Error('invalid db url')
			} else {
				console.log('valid db url provided. will use')
				process.env.DATABASE_URL = dbUrl
			}
		} else {
			throw Error('invalid arguments')
		}
	}
}
import { PrismaClient, User } from '@prisma/client'
import prisma from 'lib/prisma/prisma'
import { likeShow, LikeShowActionType } from '../../src/lib/api/shows/[id]/likeShow'
/* eslint-disable no-console */
import {
	AddFriendActionType,
	AddFriendErrorType,
	friendRequest,
	isAddFriendError
} from '../../src/lib/api/users/[id]/friendRequest'
import {
	privateIdToPrismaIdTypeMap,
	TmdbId,
	TmdbIdType
} from '../../src/lib/tmdb/api/id'

const promptly = require('promptly')

const likedShowsInCommon: TmdbId[] = [
	{
		// https://www.themoviedb.org/tv/1396-breaking-bad
		id: 1396,
		type: TmdbIdType.Show
	}
]

const users: (Pick<User, 'name' | 'image'> & { liked?: TmdbId[] })[] = [
	{
		name: 'My old friend',
		image: 'https://media.tenor.com/images/84dfa0a1739013f3ac7b544a7d8bdc08/raw',
		liked: [
			...likedShowsInCommon,
			{
				// https://www.themoviedb.org/tv/82856-the-mandalorian
				id: 82856,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/33587-ranczo
				id: 33587,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/58957-nathan-for-you
				id: 58957,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/40424-initial-d
				id: 40424,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/3703-plebania?language=pl
				id: 3703,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/6489-klan?language=pl
				id: 6489,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/6647-the-bold-and-the-beautiful?language=en
				id: 6647,
				type: TmdbIdType.Show
			},
			{
				// https://www.themoviedb.org/tv/14447-m-jak-mi-o
				id: 14447,
				type: TmdbIdType.Show
			}
		]
	},
	{
		name: 'My sweetest friend',
		image: 'https://fwcdn.pl/ppo/43/71/54371/456420.1.jpg'
	}
]

export default async function initiateDb(prisma: PrismaClient): Promise<void> {
	console.log(`Initiate dummy users if they don't exist`)
	const dummyUsersIds: number[] = []
	for (const user of users) {
		let foundUser: User | null = await prisma.user.findFirst({
			where: {
				name: {
					equals: user.name
				},
				image: {
					equals: user.image
				}
			}
		})
		if (!foundUser) {
			console.log(`Adding user ${user.name}`)
			foundUser = await prisma.user.create({
				data: {
					name: user.name,
					image: user.image
				}
			})
			// let likedPromises: Promise<Prisma.UserCreateInput['liked']['create']>
			let likedPromises: Promise<User>[]
			if (user.liked && user.liked.length > 0) {
				likedPromises = user.liked.map(tmdbId => {
					const mediaLikeReadyToInsert = {
						tmdbId: tmdbId.id,
						type: privateIdToPrismaIdTypeMap[
							// whatever
							tmdbId.type as keyof typeof privateIdToPrismaIdTypeMap
						]
					}
					return likeShow(
						foundUser.id,
						mediaLikeReadyToInsert.tmdbId,
						{
							action: LikeShowActionType.Like
						}
					)
				})
				console.log(`Adding liked shows to user ${user.name}`)
				const settledPromises = await Promise.allSettled(likedPromises)
				console.log({ settledPromises })
			} else {
				console.log(`No shows to like specified for ${user.name}`)
			}
		} else {
			console.log(`User ${user.name} already exists. Not adding`)
		}
		dummyUsersIds.push(foundUser.id)
	}
	console.log(`Looking for users apart from dummy users`)
	const otherUsers = await prisma.user.findMany({
		where: {
			id: {
				notIn: dummyUsersIds
			}
		}
	})
	if (otherUsers.length > 0) {
		// Get own id
		// https://www.npmjs.com/package/promptly
		console.log(`Found ${otherUsers.length} other users:`)
		otherUsers.forEach(usr => {
			console.log(`${usr.id} ${usr.name}`)
		})
		const chosenUser = otherUsers[0]
		const chosenId = await promptly.prompt(
			`Provide a different ID otherwise will use` +
			`${chosenUser.id} (empty to use ${chosenUser.id})`,
			{
				default: chosenUser.id.toString(),
				timeout: 2000,
				useDefaultOnTimeout: true,
				validator: (value: string) => {
					let intValue: number
					try {
						intValue = parseInt(value)
					} catch (e) {
						throw new Error(`Id must be number ${JSON.stringify(e)}`)
					}
					return intValue
				}
			}
		)
		if (chosenUser.id !== chosenId) {
			otherUsers.find(usr => usr.id === chosenId)
		}
		console.log(`Chosen user with id ${chosenUser.id} (${chosenUser.name})`)

		// Send friend request from yourself to one of the dummy users
		try {
			console.log(
				`Sending friend request from ${dummyUsersIds[0]} to ${chosenUser.id}`
			)
			await friendRequest(
				dummyUsersIds[0],
				chosenUser.id,
				{
					action: AddFriendActionType.SendFriendRequest
				}
			)
			console.log(
				`Accept friend request from ${dummyUsersIds[0]} by ${chosenUser.id}`
			)
			await friendRequest(
				chosenUser.id,
				dummyUsersIds[0],
				{
					action: AddFriendActionType.AcceptFriendRequest
				}
			)
		} catch (e) {
			if (isAddFriendError(e)) {
				if (e.addFriendErrorType === AddFriendErrorType.CantAcceptTwice) {
					console.log('Already accepted error. Ignoring.')
				} else {
					console.error('unknown addfriend error')
					console.error(e)
					throw e
				}
			} else {
				console.error('unknown error')
				console.error(e)
				throw e
			}
		}
		console.log(
			`Also adding the chosen user ${chosenUser.name}` +
			`some shows so they have them in common with ${dummyUsersIds[0]}`
		)
		try {
			for (const show of likedShowsInCommon) {
				console.log(`liking ${show.id}`)
				await likeShow(
					chosenUser.id,
					show.id,
					{
						action: LikeShowActionType.Like
					}
				)
			}
			console.log('success adding liked shows in common')
		} catch (e) {
			console.error('unknown error while adding common liked shows', e)
			console.log('ignoring')
		}
	} else {
		console.warn(`No other users apart from dummy users found - aborting`)
		console.log(`Consider adding yourself, so we can friend you`)
	}
}

if (require.main === module) {
	const disconnect = async () => {
		console.log('disconnecting')
		await prisma.$disconnect().catch(err => {
			console.log('error disconnecting', err)
		}).then(() => {
			console.log('disconnected')
		})
	}
	// FIXME: the script doesnt close despite
	//        trying to close prisma connection...
	initiateDb(prisma).catch(async err => {
		await disconnect().finally(() => {
			throw err
		})
	}).then(async () => {
		console.log('Seeding finished without error')
		await disconnect()
	})
}