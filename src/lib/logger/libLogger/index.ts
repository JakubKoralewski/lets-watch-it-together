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
	NextAuth,
	LikeShow,
	MeetingRequest
}

export interface ErrorInLibWithLoggingParams<InnerEnumType> {
	libErrorType: LibErrorType,
	innerEnum: unknown,
	innerErrorEnumValue: InnerEnumType,
	libErrorMessage?: string,
	parentLogger?: Logger,
	parentError?: Error | unknown
}

export class ErrorInLibWithLogging<InnerEnumType = undefined> extends Error {
	constructor(
		{
			libErrorType,
			innerEnum,
			innerErrorEnumValue,
			libErrorMessage,
			parentLogger,
			parentError
		}: ErrorInLibWithLoggingParams<InnerEnumType>
	) {
		super(libErrorMessage)
		let logger = libLogger
		if (parentLogger) {
			logger = parentLogger
		}
		logger.error({
			inLibErrorType: {
				string: LibErrorType[libErrorType],
				enumValue: libErrorType
			},
			msg: libErrorMessage,
			innerEnumValue: {
				string: innerEnum && innerEnum[innerErrorEnumValue],
				enumValue: innerErrorEnumValue
			},
			err: parentError,

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

