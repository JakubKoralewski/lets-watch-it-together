import React, { ReactNode } from 'react'
import Header from './Header'
import { Box, Container } from '@material-ui/core'

type Props = {
	children: ReactNode
}

const Layout: React.FC<Props> = (props) => (
	<Box>
		<Header />
		<Container className="layout">
			{props.children}
		</Container>
	</Box>
)

export default Layout
