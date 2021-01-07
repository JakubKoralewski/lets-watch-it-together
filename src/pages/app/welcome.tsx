import Protected from '../../components/Protected'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { AddFriends } from '../../components/pages/welcome/AddFriends'
import { AddShows } from '../../components/pages/welcome/AddShows'
import { AddMeeting } from '../../components/pages/welcome/AddMeeting'

enum Stages {
	AddFriends,
	AddShows,
	AddMeeting,
	Finished,
}

function Finished() {
	return <>{'That\'s all! Have fun! You are being redirected.'}</>
}

/**
 * Maps from each @see {@link Stages}
 * to a component responsible for that Stage.
 */
const stagesMap = {
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
export function WelcomeInner({onFinish}: {onFinish: () => void}): JSX.Element {
	const [stage, setStage] = useState<Stages>(0)

	const goToNextStage = () =>
		setStage((x) => Math.min(x + 1, Stages.Finished))
	const goToPrevStage = () =>
		setStage((x) => Math.max(x - 1, Stages.AddFriends))
	const CurrentComponent = stagesMap[stage]

	useEffect(() => {
		if (stage === Stages.Finished) {
			onFinish()
		}
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

export default function Welcome(): JSX.Element {
	const router = useRouter()
	const onFinish = () => {
		setTimeout(() => {
			router.push('/app')
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
