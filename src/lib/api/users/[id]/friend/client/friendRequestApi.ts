export async function apiSendFriendRequest(id: number): Promise<Response> {
	return await fetch(
		`/api/users/${id}/friend`,
		{
			method: 'POST'
		}
	)
}

export async function apiAcceptFriendRequest(id: number): Promise<Response> {
	return await fetch(
		`/api/users/${id}/friend`,
		{
			method: 'PATCH'
		}
	)
}

export async function apiUnfriend(id: number): Promise<Response> {
	return await fetch(
		`/api/users/${id}/friend`,
		{
			method: 'DELETE'
		}
	)
}

export async function apiCancelFriendRequest(id: number): Promise<Response> {
	return await fetch(
		`/api/users/${id}/friend?cancel=1`,
		{
			method: 'DELETE'
		}
	)
}
