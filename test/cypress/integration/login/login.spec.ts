/// <reference types="cypress" />
/// <reference types="node" />
/// <reference types="../../support/index" />

context('Login', () => {
	before(() => {
		cy.log(`Visiting ${Cypress.env('SITE_NAME')}`)
	})
	it('Logins two users with Github', () => {
		{
			const username = Cypress.env('TEST_GITHUB_USERNAME1')
			const password = Cypress.env('TEST_GITHUB_PASSWORD1')
			cy.loginWithGithub(username, password)
		}
		{
			const username = Cypress.env('TEST_GITHUB_USERNAME2')
			const password = Cypress.env('TEST_GITHUB_PASSWORD2')
			cy.loginWithGithub(username, password)
		}
	})
})
export {}
