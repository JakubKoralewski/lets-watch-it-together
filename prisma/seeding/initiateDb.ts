import prisma from '../../src/lib/prisma/prisma'
import {User} from '@prisma/client'

const users: Pick<User, 'name' | 'image'>[] = [
	{
		name: 'My old friend',
		image: 'https://media.tenor.com/images/84dfa0a1739013f3ac7b544a7d8bdc08/raw',
	},
	{
		name: 'My sweetest friend',
		image: 'https://fwcdn.pl/ppo/43/71/54371/456420.1.jpg'
	}
]

export default async function initiateDb(): Promise<void> {
	for(const user of users) {
		const foundUser: User | null = await prisma.user.findFirst({
			where: {
				name: {
					equals:
						user.name
				},
				image: {
					equals: user.image
				},
			}
		})
		if(!foundUser) {
			await prisma.user.create({
				data: {
					name: user.name,
					image: user.image
				}
			})
		}
	}
	prisma.$disconnect()
}

if(require.main === module) {
	initiateDb().catch(err => {
		throw err
	}).then(() => {
		console.log("Seeding finished without error")
	})
}