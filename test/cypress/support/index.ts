// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
// import './commands'

import Chainable = Cypress.Chainable
import Cookie = Cypress.Cookie

Cypress.Commands.add('dataTestId', (value: string) => {
	return cy.get(`[data-testid=${value}]`)
})

Cypress.Commands.add(
	'loginWithGithub',
	(email: string, password: string): Chainable<unknown> => {
		const cookieName = Cypress.env('COOKIE_NAME')
		return cy.visit('/').url().then(url => {
			if (url.includes('/app')) {
				cy.log('already logged in')
				return
			}

			cy.dataTestId('sign-in-github').click()

			const socialLoginOptions = {
				username: email,
				password,
				loginUrl: Cypress.env('SITE_NAME'),
				isPopup: false,
				loginSelector: `[data-testid=sign-in-github]`,
				postLoginSelector: `[data-testid=header]`
			}
			return cy.task(
				'GithubSocialLogin',
				socialLoginOptions
			).then(({ cookies }: {cookies: Cookie[]}) => {
				cy.clearCookies()
				const cookie = cookies
					.filter(cookie => cookie.name === cookieName)
					.pop()
				if (cookie) {
					cy.log(JSON.stringify({cookie}))
					cy.setCookie(cookie.name, cookie.value, {
						domain: cookie.domain,
						expiry: cookie.expiry,
						httpOnly: cookie.httpOnly,
						path: cookie.path,
						secure: cookie.secure,
					})

					Cypress.Cookies.defaults({
						preserve: cookieName,
					})
				}
			})
		})
	}
)
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Alternatively you can use CommonJS syntax:
// require('./commands')
