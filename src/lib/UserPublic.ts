export type UserPublic = {
	id: number
	name: string
	image: string
}

type UserPublicSearchResultKeys = 'id' | 'name' | 'image'
export type UserPublicSearchResult = Pick<
	UserPublic,
	UserPublicSearchResultKeys
>