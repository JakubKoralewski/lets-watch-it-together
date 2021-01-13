import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { ThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from 'theme'
import store from 'store'
import { motion } from 'framer-motion'
import { AppProps } from 'next/app'
import { Provider as NextAuthProvider } from 'next-auth/client'

// https://github.com/vercel/next.js/blob/canary/examples/with-framer-motion/pages/_app.js
function handleExitComplete() {
	if (typeof window !== 'undefined') {
		window.scrollTo({ top: 0 })
	}
}

export default function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()

	React.useEffect(() => {
		// Remove the server-side injected CSS.
		const jssStyles = document.querySelector('#jss-server-side')
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles)
		}
	}, [])

	return (
		<React.Fragment>
			<Head>
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width"
				/>
			</Head>
			<ThemeProvider theme={theme}>
				{/* CssBaseline kickstart an elegant, consistent,
					 and simple baseline to build upon. */}
				<CssBaseline />
				<Provider store={store}>
					<NextAuthProvider session={pageProps.session}>
						<AnimatePresence
							exitBeforeEnter
							onExitComplete={handleExitComplete}
						>
							<motion.div
								key={router.route}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								layout
							>
								<Component
									{...pageProps}
								/>
							</motion.div>
						</AnimatePresence>
					</NextAuthProvider>
				</Provider>
			</ThemeProvider>
		</React.Fragment>
	)
}

MyApp.propTypes = {
	Component: PropTypes.elementType.isRequired,
	pageProps: PropTypes.object.isRequired
}
