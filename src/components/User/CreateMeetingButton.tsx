import { Button } from '@material-ui/core'

export interface CreateMeetingButtonProps {
	onClick(): void
}

export default function CreateMeetingButton({
	onClick
}: CreateMeetingButtonProps): JSX.Element
{
	const innerOnClick = async () => {
		console.log("TODO: send request")
	}

	const newOnClick = async () => {
		await innerOnClick()
		onClick()
	}
	return (
		<Button
			variant={'contained'}
			color={'primary'}
			disabled={false}
			onClick={newOnClick}
		>
			{`Create meeting`}
		</Button>
	)

}
