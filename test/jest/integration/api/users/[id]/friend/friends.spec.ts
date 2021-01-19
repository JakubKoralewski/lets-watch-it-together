import prisma from 'lib/prisma/prisma'

describe('friend requests', () => {
	beforeAll(() => {
		// https://www.postgresql.org/docs/9.1/sql-start-transaction.html
		prisma.$executeRaw('BEGIN TRANSACTION')
	})

	afterAll(() => {
		prisma.$executeRaw('ROLLBACK')
	})

	it('send/accept flow of friend requests works', async () => {

	})
})