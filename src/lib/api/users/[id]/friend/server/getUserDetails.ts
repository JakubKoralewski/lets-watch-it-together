import { mapUserToUserPublicSearchResult } from 'lib/api/users/UserPublic'
import prisma from 'lib/prisma/prisma'
import { FriendRequests, FriendshipType, MediaLikeState, MeetingState, User } from '@prisma/client'
import { mapUserToKnownFriend, UserDetails } from '../../../UserDetails'
import { mapMeetingToMeetingFriendResult, MeetingFriendResult } from '../../../../meetings/MeetingFriendResult'
import { ErrorInLibWithLogging, LibErrorType } from '../../../../../logger/libLogger'
import { mediaLikeToId } from '../../../../../tmdb/api/id'
import getShowDetails from '../../../../shows/getShowDetails'
import { createLogger, LoggerTypes } from '../../../../../logger'
import { stripDetails, StrippedShowDetails } from '../../../../shows/[id]/StrippedShowDetails'
import { mapShowLiked } from '../../../../shows/[id]/isShowLiked'

export enum GetUserDetailsErrorType {
	/** FIXME: ignore edge case
	 *         this should probably be better handled
	 */
	CantGetInformationAboutYourself,
	UserIdDoesntExist,
	ClientLiedAboutBeingFriends,
}
const logger = createLogger(LoggerTypes.GetUserDetails)

export const GET_USER_DETAILS_LIKED_SHOWS_TAKE_FIRST_NUM = 10

export class GetUserDetailsError extends
	ErrorInLibWithLogging<GetUserDetailsErrorType>
{
	constructor(
		public getUserDetailsErrorType: GetUserDetailsErrorType,
		public mapMessage?: string
	) {
		super(
			{
				libErrorType: LibErrorType.GetUserDetails,
				innerEnum: GetUserDetailsErrorType,
				innerErrorEnumValue: getUserDetailsErrorType,
				libErrorMessage: mapMessage
			}
		)
	}
}

export function isGetUserDetailsError(err: Error):
	err is GetUserDetailsError {
	return (
		err instanceof GetUserDetailsError ||
		(
			typeof err === 'object' && ('getUserDetailsErrorType' in err)
		)
	)
}

/*
export enum GetOptional {
	Nothing,
	JustIds,
	All
}
/!**
 *  https://github.com/prisma/prisma/discussions/4933
 *!/
export function ifNotNothingWithOverwrite(
	optional: GetOptional
): <T extends FindManyFriendRequestsArgs | FindManyMeetingArgs,
	P extends T['select'] = T['select']>(ifNotNothing: T, ifJustIdsOverwrite: P) => T | false {
	const isNotNothing = optional !== GetOptional.Nothing
	const isJustIds = optional === GetOptional.JustIds
	return (ifNotNothing, ifJustIdsOverwrite) => isNotNothing ?
		(
			isJustIds && ifJustIdsOverwrite ?
				{ ...ifNotNothing, ...ifJustIdsOverwrite } :
				ifNotNothing
		) : false
}
*/

/*export function ifNotNothingWithOvewrite<
	Delegate extends Prisma.MeetingDelegate | Prisma.FriendRequestsDelegate
>(
	optional: GetOptional
): <
	T extends Parameters<Delegate['findMany']>[0],
	P extends T['select'] = T['select']
>(ifNotNothing: T, ifJustIdsOverwrite: P) =>
	typeof optional extends GetOptional.All ?
		T :
		typeof optional extends GetOptional.JustIds ?
			ReturnType<Delegate['findMany']> :
		undefined
{
	const isNotNothing = optional !== GetOptional.Nothing
	const isJustIds = optional === GetOptional.JustIds
	return (ifNotNothing, ifJustIdsOverwrite) => isNotNothing ?
		(
			isJustIds && ifJustIdsOverwrite ?
				{ ...ifNotNothing, ...ifJustIdsOverwrite} :
				ifNotNothing
		) : undefined
}*/

/*
export interface GetUserDetailsOptionalParams {
	includeMeetings: GetOptional,
	includeFriends: GetOptional
}
*/

/** Should only get meetings if the user is a friend
 *  @param userIdInQuestion - user to get the details of
 *  @param sessionUserId - the session of the current user
 *  @param clientClaimsTheyAreFriends - only used to make sure the client is telling the truth
 *         we use this to be able to throw an error and see some bug has appeared in our code
 */
export async function getUserDetails(
	userIdInQuestion: User['id'],
	sessionUserId: User['id'],
	clientClaimsTheyAreFriends: boolean
	/*
		{
			includeMeetings = GetOptional.All,
			includeFriends = GetOptional.All
		}: GetUserDetailsOptionalParams
	*/
): Promise<UserDetails> {
	if(sessionUserId === userIdInQuestion) {
		throw new GetUserDetailsError(
			GetUserDetailsErrorType.CantGetInformationAboutYourself
		)
	}
	// TODO: redis cache??? materialized views? http cache headers?
	// TODO: graphql would take care of whether we should return
	//       just meeting ids or the full thing
	/*
		const ifIncludeMeetingsNotNothing = ifNotNothingWithOverwrite(includeMeetings)
		const ifIncludeFriendsNotNothing = ifNotNothingWithOverwrite(includeFriends)
		const friendRequestsSent =
			ifIncludeFriendsNotNothing<FindManyFriendRequestsArgs>(
				{
					where: {
						requesteeId: sessionUserId,
						friendshipType: FriendshipType.ACCEPTED
					}
				},
				{
					requesteeId: true,
					requesterId: true
				}
			)
		const friendRequestsReceived =
			ifIncludeFriendsNotNothing<FindManyFriendRequestsArgs>(
				{
					where: {
						requesteeId: sessionUserId,
						friendshipType: FriendshipType.ACCEPTED
					}
				},
				{
					requesteeId: true,
					requesterId: true
				}
			)
		const meetingsCreated =
			ifIncludeMeetingsNotNothing<FindManyMeetingArgs>(
				{
					where: {
						state: MeetingState.ACCEPTED,
						inviteeId: sessionUserId
					}
				},
				{
					id: true
				}
			)
		const meetingsReceived =
			ifIncludeMeetingsNotNothing<FindManyMeetingArgs>(
				{
					where: {
						state: MeetingState.ACCEPTED,
						inviterId: sessionUserId
					}
				},
				{
					id: true
				}
			)
	*/

	const user = await prisma.user.findUnique({
		where: {
			id: userIdInQuestion
		},
		include: {
			liked: {
				where: {
					state: MediaLikeState.LIKED
				},
				take: GET_USER_DETAILS_LIKED_SHOWS_TAKE_FIRST_NUM,
			},
			friendRequestsSent:
				{
					where: {
						friendshipType: FriendshipType.ACCEPTED
					},
					include: {
						requestee: true
					}
				},
			friendRequestsReceived:
				{
					where: {
						friendshipType: FriendshipType.ACCEPTED
					},
					include: {
						requester: true
					}
					//TODO: cursor pagination https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
					//      of friends, probably next pages should be in /api/users/[id]/friends?after=[id]&take=[num]
					//      https://github.com/prisma/prisma/discussions/4888
				},
			meetingsCreated:
				{
					where: {
						state: {
							in: [MeetingState.ACCEPTED_INVITER, MeetingState.ACCEPTED_INVITEE]
						},
						inviteeId: sessionUserId
					}
				},
			meetingsReceived:
				{
					where: {
						state: {
							in: [MeetingState.ACCEPTED_INVITER, MeetingState.ACCEPTED_INVITEE]
						},
						inviterId: sessionUserId
					}
				}
		}
	})
	if (!user) {
		throw new GetUserDetailsError(
			GetUserDetailsErrorType.UserIdDoesntExist
		)
	}
	let likedPromises: Promise<StrippedShowDetails>[] = []
	if(user.liked.length > 0) {
		// If empty liked shows no need
		likedPromises = user.liked.map(async mediaLike => {
			const tmdbId = mediaLikeToId(mediaLike)
			const showDetails = await getShowDetails(tmdbId)
			const strippedDetails = stripDetails(showDetails)
			const mapLikedFunc = mapShowLiked(sessionUserId)
			return await mapLikedFunc(strippedDetails) as StrippedShowDetails
		})
		// we await later
	}
	let areFriends = false, areFriendsSince: Date = undefined
	const ifAreFriends = (fr: FriendRequests, user: User) => {
		if(areFriends) return
		if(user.id === sessionUserId) {
			areFriends = true
			areFriendsSince = fr.acceptedAt
		}
	}
	const friends = user.friendRequestsSent
		.map(friendRequest => {
			ifAreFriends(friendRequest, friendRequest.requestee)
			return mapUserToKnownFriend(friendRequest.requestee)
		})
		.concat(
			user.friendRequestsReceived
				.map(friendRequest => {
					ifAreFriends(friendRequest, friendRequest.requester)
					return mapUserToKnownFriend(friendRequest.requester)
				})
		)
	if(clientClaimsTheyAreFriends && !areFriends) {
		throw new GetUserDetailsError(
			GetUserDetailsErrorType.ClientLiedAboutBeingFriends
		)
	}
	let meetings: MeetingFriendResult[] = []
	if(areFriends) {
		// We only give meeting information about user if the users are friends
		// We map the database meeting model to something the frontend
		// can easily understand
		const mapMeetingFunc = mapMeetingToMeetingFriendResult(user.id)
		meetings = user.meetingsCreated
			.map(mapMeetingFunc)
			.concat(
				user.meetingsReceived.map(
					mapMeetingFunc
				)
			)
	}
	const userWithFriendStatus = mapUserToUserPublicSearchResult(user)

	// await liked response
	const likedResults =
		await Promise.allSettled(likedPromises)
	const liked = likedResults.flatMap(result => {
		if(result.status === 'rejected') {
			logger.error({
				msg: `promise rejected when getting liked show info`,
				err: result.reason
			})
			return []
		} else {
			return [result.value]
		}
	})
	logger.info({liked})

	const rv = {
		...userWithFriendStatus,
		friends,
		meetings,
		liked,
		registeredAt: user.createdAt.toISOString(),
		friendsAt: areFriendsSince && areFriendsSince.toISOString()
	}

	return rv
}