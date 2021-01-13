import { debounce } from 'lodash'
import { useCallback } from 'react'

type Func<Input, Return> = (_: Input) => Promise<Return>

/** https://stackoverflow.com/a/58594348/10854888 */
export default function useDebounced<T>(
	searchFunction: Func<string, T>,
	debounceLengthMs = 200
): Func<string, T> {
	return useCallback(debounce(searchFunction, debounceLengthMs), [])
}
