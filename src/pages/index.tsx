import React from 'react'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import ProTip from 'components/ProTip'
import NextLink from 'next/link'
import Copyright from 'components/Copyright'
import ReduxExample from 'components/ReduxExample'
import Layout from 'components/Layout'

export default function Index() {
	return (
		<Layout>
			<Container maxWidth="sm">
				<Box my={4}>
					<ReduxExample />
					<Typography variant="h4" component="h1" gutterBottom>
						Next.js example
					</Typography>
					<NextLink href={'/about'} as={'/about'}>
						Go to the about page
					</NextLink>
					{/*<Link href="/about" color="secondary">*/}
					{/*	Go to the about page*/}
					{/*</Link>*/}
					<ProTip />
					<Copyright />
				</Box>
			</Container>
		</Layout>
	)
}
