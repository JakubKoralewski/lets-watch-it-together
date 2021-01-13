import { Button } from '@material-ui/core'

export interface CreateMeetingButtonProps {
	onClick(): void
}

export default function CreateMeetingButton({
	onClick
}: CreateMeetingButtonProps): JSX.Element
{
	return (
		<Button
			variant={'contained'}
			color={'primary'}
			disabled={false}
			onClick={onClick}
		>
			{`Create meeting`}
		</Button>
	)

}
