import React, { useEffect } from 'react'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Copyright from 'components/Copyright'
import { Avatar, CssBaseline } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { makeStyles } from '@material-ui/core/styles'
import { getProviders, signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}))

type ThenArg<T> =
	T extends PromiseLike<infer U> ? U : T

interface ProvidersProps {
	providers: ThenArg<ReturnType<(typeof getProviders)>>
}

function SignIn({ providers }: ProvidersProps) {
	const classes = useStyles()
	return (
		<div className={classes.form}>
			{Object.values(providers).map((provider) => (
				<div key={provider.name}>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						onClick={() => signIn(provider.id, {callbackUrl: "/app"})}
					>
						Sign In with {provider.name}
					</Button>
				</div>
			))}
		</div>
	)
}

export async function getServerSideProps() {
	return {
		props: {
			providers: await getProviders(),
		},
	}
}

export default function Index({ providers }: ProvidersProps) {
	const classes = useStyles()
	const router = useRouter()
	const [session, _loading] = useSession()
	useEffect(() => {
		if(session) {
			router.push('/app')
		}
	}, [])
	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<SignIn providers={providers} />
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	)
}
