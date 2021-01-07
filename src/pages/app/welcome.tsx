import Protected from '../../components/Protected'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { AddFriends } from '../../components/pages/welcome/AddFriends'
import { AddShows } from '../../components/pages/welcome/AddShows'

enum Stages {
	AddFriends,
	AddShows,
	Finished,
}

function Finished() {
	return <>{'That\'s all! Have fun! You are being redirected.'}</>
}

const stagesMap = {
	[Stages.AddFriends]: AddFriends,
	[Stages.AddShows]: AddShows,
	[Stages.Finished]: Finished
}

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
