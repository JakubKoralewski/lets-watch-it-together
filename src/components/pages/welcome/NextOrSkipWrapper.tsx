import { PropsWithChildren } from 'react'
import { Button, Container } from '@material-ui/core'

export interface GoToNextStageProps {
	nextStage(): void,

	canGoForward?: boolean,
	currentStage: number,
	maxStage: number,

	prevStage(): void
}
/**
 * TODO: https://material-ui.com/components/steppers/
 */
export function NextOrSkipWrapper(
	{
		nextStage,
		children,
		canGoForward,
		currentStage,
		prevStage
	}: PropsWithChildren<GoToNextStageProps>
): JSX.Element {
	const canGoBack = currentStage >= 1

	return (
		<Container>
			<div>{children}</div>
			<Button
				color="primary"
				disabled={!canGoBack}
				onClick={canGoBack ? prevStage : undefined}
			>
				BACK
			</Button>
			<Button
				variant="contained"
				color="primary"
				disabled={!canGoForward}
				onClick={canGoForward ? nextStage : undefined}
			>
				NEXT
			</Button>
			<Button
				onClick={nextStage}
				color="secondary"
			>
				SKIP
			</Button>
		</Container>
	)
}
