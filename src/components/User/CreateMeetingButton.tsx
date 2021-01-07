import { Button } from '@material-ui/core'

export interface CreateMeetingButtonProps {
	onClick(): void
}

export default function CreateMeetingButton({
	onClick
}: CreateMeetingButtonProps): JSX.Element
{
	let innerOnClick: () => unknown

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
