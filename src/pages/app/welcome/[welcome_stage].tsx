import { useRouter } from 'next/router'
import Protected from '../../../components/Protected'
import Layout from '../../../components/Layout'
import { WelcomeInner } from './index'
import { useEffect, useRef } from 'react'
import { Stages } from '../../../components/pages/welcome/stages'
import { NextPageContext } from 'next'

export const stagesToPathsMap = {
	[Stages.AddFriends]: 'add-friends',
	[Stages.AddShows]: 'add-shows',
	[Stages.AddMeeting]: 'add-meeting',
	[Stages.Finished]: 'finished'
} as const

export const pathsToStagesMap = {
	'add-friends': Stages.AddFriends,
	'add-shows': Stages.AddShows,
	'add-meeting': Stages.AddMeeting,
	'finished': Stages.Finished
} as const

export async function getServerSideProps(
	context: NextPageContext
): Promise<{ props: WelcomeStageSSRProps }> {
	return {
		props: {
			stage: context.query.welcome_stage as WelcomeStageSSRProps['stage']
		}
	}
}

interface WelcomeStageSSRProps {
	stage:
		(typeof stagesToPathsMap)[keyof typeof stagesToPathsMap]
}

export default function WelcomeStage(
	{
		stage
	}: WelcomeStageSSRProps
): JSX.Element {
	const router = useRouter()
	useEffect(() => {
		if (!(stage in pathsToStagesMap)) {
			console.error('invalid path')
			void router.push('/app/welcome')
		}
	}, [])

	const onFinish = () => {
		setTimeout(() => {
			router.push('/app')
		}, 1000)
	}

	return (
		<Protected>
			<Layout>
				<WelcomeInner
					onFinish={onFinish}
					stage={pathsToStagesMap[stage]}
				/>
			</Layout>
		</Protected>
	)
}
