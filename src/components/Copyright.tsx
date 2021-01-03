import React from 'react'
import Typography from '@material-ui/core/Typography'
import Link from './Link'

export default function Copyright() {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{'Copyright © '}
			<Link color="inherit" href="https://github.com/JakubKoralewski/lets-watch-it-together/blob/main/LICENSE">
				{"Let's Watch It Together"}
			</Link>{' '}
			{new Date().getFullYear()}
			{'.'}
		</Typography>
	);
}
