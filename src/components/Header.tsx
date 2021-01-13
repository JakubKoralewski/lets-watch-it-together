import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/client'
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import Badge from '@material-ui/core/Badge'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import AccountCircle from '@material-ui/icons/AccountCircle'
import NotificationsIcon from '@material-ui/icons/Notifications'
import MoreIcon from '@material-ui/icons/MoreVert'
import { Avatar } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		fixA: {
			textDecoration: 'none',
			color: 'initial'
		},
		grow: {
			flexGrow: 1
		},
		menuButton: {
			marginRight: theme.spacing(2)
		},
		title: {
			display: 'none',
			[theme.breakpoints.up('sm')]: {
				display: 'block'
			},
			cursor: 'pointer'
		},
		search: {
			position: 'relative',
			borderRadius: theme.shape.borderRadius,
			backgroundColor: fade(theme.palette.common.white, 0.15),
			'&:hover': {
				backgroundColor: fade(theme.palette.common.white, 0.25)
			},
			marginRight: theme.spacing(2),
			marginLeft: 0,
			width: '100%',
			[theme.breakpoints.up('sm')]: {
				marginLeft: theme.spacing(3),
				width: 'auto'
			}
		},
		searchIcon: {
			padding: theme.spacing(0, 2),
			height: '100%',
			position: 'absolute',
			pointerEvents: 'none',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},
		inputRoot: {
			color: 'inherit'
		},
		inputInput: {
			padding: theme.spacing(1, 1, 1, 0),
			// vertical padding + font size from searchIcon
			paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
			transition: theme.transitions.create('width'),
			width: '100%',
			[theme.breakpoints.up('md')]: {
				width: '20ch'
			}
		},
		sectionDesktop: {
			display: 'none',
			[theme.breakpoints.up('md')]: {
				display: 'flex'
			}
		},
		sectionMobile: {
			display: 'flex',
			[theme.breakpoints.up('md')]: {
				display: 'none'
			}
		},
		customAvatar: {
			large: {
				width: theme.spacing(7),
				height: theme.spacing(7)
			}
		}
	})
)


/**
 * https://material-ui.com/components/app-bar/#app-bar-with-a-primary-search-field
 */
const Header: React.FC = () => {
	const router = useRouter()
	const isActive = (pathname: string): boolean =>
		router.pathname === pathname

	const [session, loading] = useSession()
	console.log('session', session)

	let left = (
		<div className="left">
			<Link href="/">
				<a className="bold" data-active={isActive('/')}>
					Feed
				</a>
			</Link>
		</div>
	)

	let right = null

	//FIXME: use this
	if (loading) {
		left = (
			<div className="left">
				<Link href="/">
					<a className="bold" data-active={isActive('/')}>
						Feed
					</a>
				</Link>
			</div>
		)
		right = (
			<div className="right">
				<p>Validating session ...</p>
			</div>
		)
	}

	//FIXME: use this
	if (!session) {
		right = (
			<div className="right">
				<Link href="/api/auth/signin">
					<a data-active={isActive('/signup')}>Log in</a>
				</Link>
			</div>
		)
	}

	const classes = useStyles()
	const [anchorEl, setAnchorEl] =
		React.useState<null | HTMLElement>(null)
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
		React.useState<null | HTMLElement>(null)

	const isMenuOpen = Boolean(anchorEl)
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
		handleMobileMenuClose()
	}

	const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setMobileMoreAnchorEl(event.currentTarget)
	}

	const menuId = 'primary-search-account-menu'
	const renderMenu = (
		<Menu
			// anchorEl={anchorEl}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			id={menuId}
			keepMounted
			// transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			open={isMenuOpen}
			onClose={handleMenuClose}
		>
			<MenuItem onClick={handleMenuClose} disabled>Profile</MenuItem>
			<MenuItem onClick={handleMenuClose} disabled>My account</MenuItem>
			<MenuItem onClick={() => signOut({ callbackUrl: '/' })}>Log out</MenuItem>
		</Menu>
	)

	const mobileMenuId = 'primary-search-account-menu-mobile'
	const renderMobileMenu = (
		<Menu
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			id={mobileMenuId}
			keepMounted
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}
		>
			<MenuItem>
				<IconButton aria-label="show 11 new notifications" color="inherit">
					<Badge badgeContent={11} color="secondary">
						<NotificationsIcon />
					</Badge>
				</IconButton>
				<p>Notifications</p>
			</MenuItem>
			<MenuItem onClick={handleProfileMenuOpen}>
				<IconButton
					aria-label="account of current user"
					aria-controls="primary-search-account-menu"
					aria-haspopup="true"
					color="inherit"
				>
					<AccountCircle />
				</IconButton>
				<p>Profile</p>
			</MenuItem>
		</Menu>
	)

	return (
		<div className={classes.grow}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						edge="start"
						className={classes.menuButton}
						color="inherit"
						aria-label="open drawer"
					>
						<MenuIcon />
					</IconButton>
					<Link
						href={'/app'}
					>
						<a
							className={classes.fixA}
							style={{color: 'white'}}
						>
							<Typography
								className={classes.title}
								variant="h6"
								noWrap
							>
								{`Let's Watch It Together`}
							</Typography>
						</a>
					</Link>
					<div className={classes.search}>
						<div className={classes.searchIcon}>
							<SearchIcon />
						</div>
						<InputBase
							placeholder="Search…"
							classes={{
								root: classes.inputRoot,
								input: classes.inputInput
							}}
							inputProps={{ 'aria-label': 'search' }}
						/>
					</div>
					<div className={classes.grow} />
					<div className={classes.sectionDesktop}>
						<IconButton
							aria-label="show 17 new notifications"
							color="inherit"
						>
							<Badge badgeContent={17} color="secondary">
								<NotificationsIcon />
							</Badge>
						</IconButton>
						<IconButton
							edge="end"
							aria-label="account of current user"
							aria-controls={menuId}
							aria-haspopup="true"
							onClick={handleProfileMenuOpen}
							color="inherit"
						>
							{
								session.user.image ?
									<Avatar
										className={classes.customAvatar}
										alt={'user\'s avatar from auth provider'}
										src={session.user.image}
									/> :
									<AccountCircle />
							}
						</IconButton>
					</div>
					<div className={classes.sectionMobile}>
						<IconButton
							aria-label="show more"
							aria-controls={mobileMenuId}
							aria-haspopup="true"
							onClick={handleMobileMenuOpen}
							color="inherit"
						>
							<MoreIcon />
						</IconButton>
					</div>
				</Toolbar>
			</AppBar>
			{renderMobileMenu}
			{renderMenu}
		</div>
	)

}

export default Header
