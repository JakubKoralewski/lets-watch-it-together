/* eslint-disable no-console */
import { PrismaClient, User } from '@prisma/client'
import {
	addFriend, AddFriendErrorType, isAddFriendError
} from '../../src/lib/api/users/[id]/addFriend'
import HTTPMethod from '../../src/lib/utils/HTTPMethod'

const promptly = require('promptly')

const users: Pick<User, 'name' | 'image'>[] = [
	{
		name: 'My old friend',
		image: 'https://media.tenor.com/images/84dfa0a1739013f3ac7b544a7d8bdc08/raw'
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
					equals:
					user.name
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
			`Provide a different ID otherwise will use ${chosenUser.id} (empty to use ${chosenUser.id})`,
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
			await addFriend(
				chosenUser.id,
				dummyUsersIds[0],
				{
					method: HTTPMethod.POST
				}
			)
		} catch (e) {
			if(isAddFriendError(e)) {
				if(e.addFriendErrorType === AddFriendErrorType.CantAcceptTwice) {
					console.log("Already accepted error. Ignoring.")
				} else {
					console.error("unknown addfriend error")
					console.error(e)
					throw e
				}
			} else {
				console.error("unknown error")
				console.error(e)
				throw e
			}
		}
	} else {
		console.warn(`No other users apart from dummy users found - aborting`)
		console.log(`Consider adding yourself, so we can friend you`)
	}
}

if (require.main === module) {
	const fileIndex = process.argv.findIndex((val) => val.endsWith('initiateDb.ts'))
	const optionalArguments = process.argv.slice(fileIndex + 1)
	console.log({ optionalArguments })
	let dbUrl: string
	if (optionalArguments.length >= 1) {
		if (optionalArguments.length === 1) {
			dbUrl = optionalArguments[0]
			if (!dbUrl.startsWith('postgres://')) {
				throw Error('invalid db url')
			} else {
				console.log('valid db url provided. will use')
			}
		} else {
			throw Error('invalid arguments')
		}
	}
	const prisma = new PrismaClient(dbUrl ? {
		datasources: {
			db: {
				url: dbUrl
			}
		}
	} : undefined)
	const disconnect = async () => {
		console.log('disconnecting')
		await prisma.$disconnect().catch(err => {
			console.log('error disconnecting', err)
		}).then(() => {
			console.log('disconnected')
		})
	}
	initiateDb(prisma).catch(async err => {
		await disconnect().finally(() => {
			throw err
		})
	}).then(async () => {
		console.log('Seeding finished without error')
		await disconnect()
	})
}