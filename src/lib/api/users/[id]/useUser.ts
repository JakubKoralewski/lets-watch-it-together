import useSWR from "swr"
import {User} from "@prisma/client"
import { getFetcher, UseEntityReturnType } from '../../utils/useSwrUtils'
import { UserDetails } from '../UserDetails'

export function useUser (id: User['id']):
	UseEntityReturnType<'user', UserDetails>
{
	const { data, error } = useSWR<UserDetails>(`/api/users/${id}`, getFetcher)
	return {
		user: data,
		isLoading: !error && !data,
		error: error
	}
}