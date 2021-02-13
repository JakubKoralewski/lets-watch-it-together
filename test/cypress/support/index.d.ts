/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable {
		/**
		 * Custom command to select DOM element by data-testid attribute.
		 * @example cy.dataTestId('sign-in-github')
		 */
		dataTestId(value: string): Chainable<Element>,
		loginWithGithub(email: string, password: string): Chainable<unknown>
	}
}