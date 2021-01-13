import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserPublicSearchResult } from '../../lib/api/users/UserPublic'

const initialState = {
	users: {} as Record<number, UserPublicSearchResult | undefined>
}
type State = typeof initialState
/**
 *  https://redux.js.org/tutorials/fundamentals/part-8-modern-redux
 */
const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		add: (
			state,
			action: PayloadAction<UserPublicSearchResult>
		) => {
			const user = action.payload

			state.users[user.id] = {
				...(state.users[user.id] ?? {}),
				...user
			}
		},
		// friendUser
	},
})

/**
 * Extract count from root state
 *
 * @param  state The root state
 * @param  userId The user id you want to access
 * @returns the user with the userId
 */
export const selectUser =
	(state: State, userId: number): UserPublicSearchResult =>
		state.users[userId]

export const {
	add,
} = usersSlice.actions

export default usersSlice.reducer