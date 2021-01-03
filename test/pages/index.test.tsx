import React from 'react'
import { render } from '../testUtils'
import Index from '../../src/pages/index'
import * as redux from 'react-redux'
import store from 'store'
import * as nextRouter from 'next/router'

// jest.mock('node-fetch')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import fetch from 'node-fetch'
//
//

import { act } from '@testing-library/react'
;(nextRouter as any).useRouter = jest.fn()
;(nextRouter.useRouter as jest.Mock<any, any>).mockImplementation(
	() => ({
		route: '/',
		prefetch: jest.fn().mockImplementation(async () => {}),
	})
)

// const spy = jest.spyOn(redux, 'useSelector')
// spy.mockReturnValue({ username: 'test' })

function renderWithProvider(elem: JSX.Element, options: unknown) {
	return render(
		<redux.Provider store={store}>{elem}</redux.Provider>,
		options
	)
}

describe('Home page', () => {
	beforeEach(() => {
		global.fetch = jest.fn().mockImplementation(() =>
			Promise.resolve(({
				json: () => Promise.resolve({}),
			} as any) as Response)
		)
	})
	afterEach(() => {
		jest.restoreAllMocks()
	})
	it('matches snapshot', async () => {
		const providers = {"github":{"id":"github","name":"GitHub","type":"oauth","signinUrl":"http://localhost:3000/api/auth/signin/github","callbackUrl":"http://localhost:3000/api/auth/callback/github"}};
		await act(async () => {
			const { asFragment } =
				renderWithProvider(<Index providers={providers}/>, {})

			expect(asFragment()).toMatchSnapshot()
		})
	})

	// it('clicking button triggers alert', () => {
	// 	const { getByText } = renderWithProvider(<Index />, {})
	// 	window.alert = jest.fn()
	// 	fireEvent.click(getByText('Go to the about page'))
	// 	expect(window.alert).toHaveBeenCalledWith(
	// 		'With typescript and Jest'
	// 	)
	// })
})
