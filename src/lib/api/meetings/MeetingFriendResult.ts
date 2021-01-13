import { Meeting, MeetingState, User, TmdbMediaType } from '@prisma/client'
import { prismaTmdbMediaTypeToPrivate, TmdbId, TmdbIdType } from '../../tmdb/api/id'
import assertUnreachable from '../../utils/assertUnreachable'

export enum MeetingFriendPublicEnum {
	Proposed,
	Cancelled,
	Read,
	Accepted,
	Declined,
	Watched,
	Edited
}

/** This enum assumes that the meetings
 *  are only between friends!
 */
export enum ByWhom {
	ByYou,
	ByOther
}

export type MeetingFriendState = {
	state: Exclude<MeetingFriendPublicEnum,
		MeetingFriendPublicEnum.Proposed | MeetingFriendPublicEnum.Watched>,
	by: ByWhom,
	when?: Date
} | {
	state: MeetingFriendPublicEnum.Proposed
	by?: undefined,
	when?: undefined
} | {
	state: MeetingFriendPublicEnum.Watched,
	by?: undefined,
	when?: Date
}

export type MeetingFriendResult = Pick<Meeting,
	'id' | 'inviterId' | 'inviteeId' | 'createdAt'> & {
	tmdbId: TmdbId,
	/** suggestedDate */
	date: Date,
	state: MeetingFriendState
}


function mapStateOfMeeting(
	meeting: Meeting,
	otherUserId: User['id']
): MeetingFriendState {
	let by: ByWhom | undefined
	switch (meeting.state) {
		case MeetingState.ACCEPTED_INVITEE:
		case MeetingState.DECLINED_INVITEE:
		case MeetingState.CANCELLED_INVITEE:
		case MeetingState.EDITED_INVITEE:
		case MeetingState.READ_INVITEE:
			by = otherUserId === meeting.inviteeId ? ByWhom.ByOther : ByWhom.ByYou
			break
		case MeetingState.ACCEPTED_INVITER:
		case MeetingState.DECLINED_INVITER:
		case MeetingState.CANCELLED_INVITER:
		case MeetingState.EDITED_INVITER:
		case MeetingState.READ_INVITER:
			by = otherUserId === meeting.inviterId ? ByWhom.ByOther : ByWhom.ByYou
			break
		case MeetingState.PROPOSED:
		case MeetingState.WATCHED:
			by = undefined
			break
		default: {
			assertUnreachable(meeting.state)
		}
	}
	let state: MeetingFriendPublicEnum,
		when: Date | null = null

	switch (meeting.state) {
		case MeetingState.ACCEPTED_INVITEE:
		case MeetingState.ACCEPTED_INVITER:
			state = MeetingFriendPublicEnum.Accepted
			when = meeting.acceptedAt
			break
		case MeetingState.CANCELLED_INVITEE:
		case MeetingState.CANCELLED_INVITER:
			state = MeetingFriendPublicEnum.Cancelled
			when = meeting.cancelledAt
			break
		case MeetingState.DECLINED_INVITER:
		case MeetingState.DECLINED_INVITEE:
			state = MeetingFriendPublicEnum.Declined
			when = meeting.declinedAt
			break
		case MeetingState.EDITED_INVITER:
		case MeetingState.EDITED_INVITEE:
			state = MeetingFriendPublicEnum.Edited
			when = meeting.updatedAt
			break
		case MeetingState.READ_INVITER:
		case MeetingState.READ_INVITEE:
		// TODO: implement read etc.
		// eslint-disable-next-line no-fallthrough
		case MeetingState.PROPOSED:
			state = MeetingFriendPublicEnum.Proposed
			break
		case MeetingState.WATCHED:
			state = MeetingFriendPublicEnum.Watched
			break
		default: {
			assertUnreachable(meeting.state)
		}
	}
	return {
		by,
		state,
		when: when ? when : undefined
	} as MeetingFriendState
}

/**
 *  Maps the database meeting model to client side meeting model.
 *
 *  Assumes meetings are only between friends!
 */
export function mapMeetingToMeetingFriendResult(
	otherUserId: User['id']
): (meeting: Meeting) => MeetingFriendResult {
	return (meeting: Meeting) => {
		//FIXME: use types as they should be I guess
		const mappedTmdbType = (prismaTmdbMediaTypeToPrivate as any)[
			meeting.tmdbMediaType
		] as TmdbIdType
		if(!mappedTmdbType) {
			throw Error(`invalid tmdbmediatype in meeting: ${JSON.stringify(meeting)}`)
		}
		return {
			id: meeting.id,
			inviterId: meeting.inviterId,
			inviteeId: meeting.inviteeId,
			date: meeting.suggestedDate,
			createdAt: meeting.createdAt,
			tmdbId: {
				type: mappedTmdbType,
				id: meeting.tmdb
			},
			state: mapStateOfMeeting(meeting, otherUserId)
		}
	}
}
