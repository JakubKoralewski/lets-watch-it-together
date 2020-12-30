import { debounce } from 'lodash'
import { useCallback } from 'react'

/** https://stackoverflow.com/a/58594348/10854888 */
export default function useDebouncedSearch<T>(
	searchFunction: ((_: string) => Promise<T>),
	debounceLengthMs = 200
): ((_: string) => void) {
	return useCallback(debounce(searchFunction, debounceLengthMs), [])
}
