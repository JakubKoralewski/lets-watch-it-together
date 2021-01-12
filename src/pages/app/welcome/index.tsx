import Protected from '../../../components/Protected'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { AddFriends } from '../../../components/pages/welcome/AddFriends'
import { AddShows } from '../../../components/pages/welcome/AddShows'
import { AddMeeting } from '../../../components/pages/welcome/AddMeeting'


import { stagesToPathsMap } from './[welcome_stage]'
import { Stages } from './stages'


export function Finished() {
	return <>{'That\'s all! Have fun! You are being redirected.'}</>
}

/**
 * Maps from each @see {@link Stages}
 * to a component responsible for that Stage.
 */
export const stagesMap = {
	[Stages.AddFriends]: AddFriends,
	[Stages.AddShows]: AddShows,
	[Stages.AddMeeting]: AddMeeting,
	[Stages.Finished]: Finished
}


/**
 * Right now this is also used by the index page
 * cause we have nothing else to show there anyway,
 * so thats why this is a separate function.
 */
export function WelcomeInner(
	{
		onFinish,
		stage: defaultStage=0
	}: {onFinish: () => void, stage?: number}
): JSX.Element {
	const [stage, setStage] = useState<Stages>(defaultStage)

	const goToNextStage = () =>
		setStage((x) => Math.min(x + 1, Stages.Finished))
	const goToPrevStage = () =>
		setStage((x) => Math.max(x - 1, Stages.AddFriends))
	const CurrentComponent = stagesMap[stage]

	const isMount = useRef(true)

	useEffect(() => {
		if (stage === Stages.Finished) {
			onFinish()
		}
		if(isMount.current) {
			isMount.current = false
			return
		}
		window.history.pushState(
			undefined,
			undefined,
			`/app/welcome/${stagesToPathsMap[stage]}`
		)
	}, [stage])

	return (
		<>
			{
				<CurrentComponent
					nextStage={goToNextStage}
					currentStage={stage}
					maxStage={Stages.Finished}
					prevStage={goToPrevStage}
				/>
			}
		</>
	)
}

export default function Index(): JSX.Element {
	const router = useRouter()
	const onFinish = () => {
		setTimeout(() => {
			void router.push('/app')
		}, 1000)
	}
	return (
		<Protected>
			<Layout>
				<WelcomeInner onFinish={onFinish} />
			</Layout>
		</Protected>
	)
}
