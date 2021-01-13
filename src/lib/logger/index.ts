import pino from 'pino'
let pinoCaller = (x: any) => x
if(typeof window === "undefined") {
	pinoCaller = require('pino-caller')
}

export enum LoggerTypes {
	Root='r',
	ApiError='a_e',
	ApiTrace='a_t',
	LibUtils='lu',
	AddFriend='af',
	Misc='m',
	Redis='r',
	Prisma='p',
	Tmdb='t',
	NextAuth='na',
	TmdbId='t_id',
	GetUserDetails='gud',
	ProtectedApiHandler='pah',
	IsShowLiked='isl',
	NewMeetingGetServerSideProps='nmgssp',
}

export function createLogger(
	loggerType: LoggerTypes,
	shouldHaveCallSiteInfo=true
): pino.Logger {
	let logger = rootLogger
	if(shouldHaveCallSiteInfo) {
		logger = rootLoggerWithCallsiteInfo
	}
	return logger.child({
		_lt: loggerType
	})
}

/** Don't use directly, better to use ApiLogger or other
 *  child loggers that will have more info. Create one if not
 *  exists for your domain I guess.
 */
const rootLogger = pino({
	level: process.env.NODE_ENV === 'production' ? 'trace' : 'debug'
})

const rootLoggerWithCallsiteInfo = pinoCaller(rootLogger)


