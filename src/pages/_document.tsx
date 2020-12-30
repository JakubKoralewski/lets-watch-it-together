import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import {
	description,
	ogUrl,
	shortDescription,
	summary,
} from '../../seo/seo'
import theme from '../theme'
import { ServerStyleSheets } from '@material-ui/styles'

class MyDocument extends Document {
/*	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx)
		return { ...initialProps }
	}*/

	render() {
		return (
			<Html>
				<Head>
					<meta name="application-name" content={shortDescription} />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta
						name="apple-mobile-web-app-status-bar-style"
						content="default"
					/>
					<meta
						name="apple-mobile-web-app-title"
						content={shortDescription}
					/>
					<meta name="description" content={description} />
					<meta name="format-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					{/*TODO: Add browserconfig.xml file*/}
					<meta
						name="msapplication-config"
						content="/static/icons/browserconfig.xml"
					/>
					{/*TODO: Choose color*/}
					<meta name="msapplication-TileColor" content="#2B5797" />
					<meta name="msapplication-tap-highlight" content="no" />
					{/*TODO: Choose color*/}
					<meta
						name="theme-color"
						content={theme.palette.primary.main}
					/>

					{/*TODO: Make PWA icons*/}
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="/static/icons/apple-touch-icon.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href="/static/icons/favicon-32x32.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href="/static/icons/favicon-16x16.png"
					/>
					<link rel="manifest" href="/static/manifest.json" />
					<link
						rel="mask-icon"
						href="/static/icons/safari-pinned-tab.svg"
						color="#5bbad5"
					/>
					<link
						rel="shortcut icon"
						href="/static/icons/favicon.ico"
					/>
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
					/>

					<meta name="twitter:card" content={summary} />
					<meta name="twitter:url" content={ogUrl} />
					<meta name="twitter:title" content={shortDescription} />
					<meta
						name="twitter:description"
						content={shortDescription}
					/>
					<meta
						name="twitter:image"
						content="https://yourdomain.com/static/icons/android-chrome-192x192.png"
					/>
					<meta name="twitter:creator" content="@KoralewskiJakub" />
					<meta property="og:type" content="website" />
					<meta property="og:title" content={shortDescription} />
					<meta property="og:description" content={description} />
					<meta property="og:site_name" content={shortDescription} />
					<meta property="og:url" content={ogUrl} />
					<meta
						property="og:image"
						content="https://yourdomain.com/static/icons/apple-touch-icon.png"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
	// Resolution order
	//
	// On the server:
	// 1. app.getInitialProps
	// 2. page.getInitialProps
	// 3. document.getInitialProps
	// 4. app.render
	// 5. page.render
	// 6. document.render
	//
	// On the server with error:
	// 1. document.getInitialProps
	// 2. app.render
	// 3. page.render
	// 4. document.render
	//
	// On the client
	// 1. app.getInitialProps
	// 2. page.getInitialProps
	// 3. app.render
	// 4. page.render

	// Render app and page and get the context of the page with collected side effects.
	const sheets = new ServerStyleSheets()
	const originalRenderPage = ctx.renderPage

	ctx.renderPage = () =>
		originalRenderPage({
			enhanceApp: (App) => (props) =>
				sheets.collect(<App {...props} />),
		})

	const initialProps = await Document.getInitialProps(ctx)

	return {
		...initialProps,
		// Styles fragment is rendered after the app and page rendering finish.
		styles: [
			...React.Children.toArray(initialProps.styles),
			sheets.getStyleElement(),
		],
	}
}
