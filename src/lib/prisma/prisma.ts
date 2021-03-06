import { PrismaClient, Prisma } from '@prisma/client'
import { createLogger, LoggerTypes } from '../logger'

const loggerWithCallSiteInfo = createLogger(LoggerTypes.Prisma, true)
const loggerWithoutCallSiteInfo = createLogger(LoggerTypes.Prisma, false)

export function createPrismaClient(
	options: Prisma.PrismaClientOptions = {}
): PrismaClient {
	const prisma = new PrismaClient({
		...options,
		log: [
			{
				emit: 'event',
				level: 'query',
			},
			{
				emit: 'event',
				level: 'info',
			},
			{
				emit: 'event',
				level: 'warn',
			},
		],
	})
	// loggerWithoutCallSiteInfo.info({
	// 	msg: `prisma engine config`,
	// 	engineConfig: (prisma as any)['engineConfig']
	// })
	prisma.$use(async (params, next) => {
		const before = process.hrtime()
		const result = await next(params)
		const taken = process.hrtime(before)
		loggerWithoutCallSiteInfo.trace({
			q: `${params.model}.${params.action}`,
			t: taken
		})
		return result
	})
	prisma.$on('query', e => {
		loggerWithoutCallSiteInfo.trace({
			t: 'query',
			pt: e.timestamp,
			dur: e.duration,
			par: e.params,
			qry: e.query,
			tgt: e.target
		})
	})
	prisma.$on('info', e => {
		loggerWithoutCallSiteInfo.info({
			t: 'info',
			msg: e.message,
			pt: e.timestamp,
			tgt: e.target
		})
	})

	prisma.$on('warn', e => {
		loggerWithCallSiteInfo.warn({
			t: 'warn',
			msg: e.message,
			pt: e.timestamp,
			tgt: e.target
		})
	})
	return prisma
}


export default createPrismaClient()
