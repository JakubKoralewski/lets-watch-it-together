import { createLogger, LoggerTypes } from '..'
import { Logger } from 'pino'

const libLogger =
	createLogger(LoggerTypes.LibUtils)

export enum LibErrorType {
	GetFriends,
	IsShowLiked,
	GetShowDetails,
	MapImdbToTmdbId,
	AddFriend,
	GetUserDetails,
	Tmdb,
	NextAuth
}

export class ErrorInLibWithLogging<InnerEnumType=undefined> extends Error {
	constructor(
		public libErrorType: LibErrorType,
		public innerEnum: unknown,
		public innerErrorEnumValue: InnerEnumType,
		public libErrorMessage?: string,
		public parentLogger?: Logger
	) {
		super(libErrorMessage)
		let logger = libLogger
		if(parentLogger) {
			logger = parentLogger
		}
		logger.error({
			inLibErrorType: {
				string: LibErrorType[this.libErrorType],
				enumValue: this.libErrorType,
			},
			message: libErrorMessage,
			innerEnumValue: {
				string: innerEnum && innerEnum[this.innerErrorEnumValue],
				enumValue: this.innerErrorEnumValue
			},

			// If using parentLogger the below wouldn't be here so I
			// add it for consistency
			type: LoggerTypes.LibUtils
		})
	}
}

export function isErrorInLibWithLogging(
	err: Error | undefined
): err is ErrorInLibWithLogging {
	return err && 'libErrorType' in err
}

