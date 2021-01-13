import { deserializeId, serializeId, TmdbId, TmdbIdSerialized } from '../../lib/tmdb/api/id'
import { Container, Paper, Tab, Tabs } from '@material-ui/core'
import ShowSmall, { ShowSmallProps } from '../Show/ShowSmall'
import { StrippedShowDetails } from '../../lib/api/shows/[id]/StrippedShowDetails'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import assertUnreachable from '../../lib/utils/assertUnreachable'

export interface PreviewShowsInCommonProps {
	shows: StrippedShowDetails[],
	selected?: {
		// current: TmdbId,
		isSelected: (showId: TmdbId) => boolean,
		// thisOneIs: boolean,
		onOneSelected: (show: StrippedShowDetails) => void
	}
}

enum PreviewShowsInCommonType {
	ShowsYouBothLike,
	TheirLikedShows
}

export default function PreviewShowsInCommon(
	{
		shows,
		selected
	}: PreviewShowsInCommonProps
): JSX.Element {
	const [value, setValue] = useState(
		PreviewShowsInCommonType.ShowsYouBothLike
	)

	let toShow: JSX.Element
	let selectPropsForShowSmallGenerate:
		((id: TmdbId) => ShowSmallProps['selected']) | (() => undefined) = (_) => undefined

	if(selected) {
		selectPropsForShowSmallGenerate = (id: TmdbId) => ({
			onSelect: selected.onOneSelected,
			isSelected: selected.isSelected(id)
		})
	}

	switch (value) {
		case PreviewShowsInCommonType.ShowsYouBothLike:
			if (shows.length === 0) {
				toShow = <motion.div
					key={value}
				>
					{'No shows in common'}
				</motion.div>
			} else {
				toShow = <motion.div
					key={value}
				>
					{
						shows.filter(show => show.liked).map(show =>
							<ShowSmall
								key={serializeId(show.id)}
								show={show}
								selected={selectPropsForShowSmallGenerate(show.id)}
							/>
						)
					}
				</motion.div>
			}
			break
		case PreviewShowsInCommonType.TheirLikedShows:
			if (shows.length === 0) {
				toShow = <motion.div
					key={value}
				>
					{'User has no liked shows'}
				</motion.div>
			} else {
				toShow = <motion.div
					key={value}
				>
					{
						shows.map(show =>
							<ShowSmall
								key={serializeId(show.id)}
								show={show}
								selected={selectPropsForShowSmallGenerate(show.id)}
							/>
						)
					}
				</motion.div>
			}
			break
		default:
			assertUnreachable(value)
	}

	const handleChange = (
		event: React.ChangeEvent<Record<never, never>>,
		newValue: number
	) => {
		setValue(newValue)
	}

	return (
		<Container>
			<Paper square>
				{/*https://material-ui.com/components/tabs/*/}
				<Tabs
					value={value}
					indicatorColor="primary"
					textColor="primary"
					onChange={handleChange}
				>
					<Tab label="Shows you both like" />
{/*
					<Tab label="View all their liked shows" />
*/}
				</Tabs>
			</Paper>
			<Container>
				<AnimatePresence
					exitBeforeEnter={true}
				>
					{
						toShow
					}
				</AnimatePresence>
			</Container>
		</Container>
	)
}