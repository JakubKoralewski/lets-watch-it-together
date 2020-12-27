import React, { MutableRefObject, PropsWithChildren } from 'react'
import clsx from 'clsx'
import { Router, useRouter } from 'next/router'
import NextLink from 'next/link'
import MuiLink from '@material-ui/core/Link'
import { TypographyTypeMap } from '@material-ui/core'

interface NextComposedProps {
	as?: string | object
	href: string | object
	prefetch?: boolean
	className?: string
}

const NextComposed = React.forwardRef<HTMLAnchorElement, NextComposedProps>(
	function NextComposed(props, ref) {
		const { as, href, ...other } = props

		return (
			<NextLink href={href} as={as}>
				<a ref={ref} {...other} />
			</NextLink>
		)
	}
)

interface LinkProps {
	activeClassName?: string
	as?: string | object
	className?: string
	href: string | Router
	innerRef:
		| ((instance: HTMLAnchorElement) => void)
		| MutableRefObject<HTMLAnchorElement>
	naked?: boolean
	onClick?: () => void
	prefetch?: boolean
	color: TypographyTypeMap['props']['color']
}

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: LinkProps): JSX.Element {
	const {
		href,
		activeClassName = 'active',
		className: classNameProps,
		innerRef,
		naked,
		...other
	} = props

	const router = useRouter()
	const pathname = typeof href === 'string' ? href : href.pathname
	const className = clsx(classNameProps, {
		[activeClassName]: router.pathname === pathname && activeClassName,
	})

	if (naked) {
		return (
			<NextComposed
				className={className}
				ref={innerRef}
				href={href}
				{...other}
			/>
		)
	}

	return (
		<MuiLink
			component={NextComposed}
			className={className}
			ref={innerRef}
			href={pathname}
			{...other}
		/>
	)
}

export default React.forwardRef<
	HTMLAnchorElement,
	PropsWithChildren<Omit<LinkProps, 'innerRef'>>
>((props, ref) => <Link {...props} innerRef={ref} />)
