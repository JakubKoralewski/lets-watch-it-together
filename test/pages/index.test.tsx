import React from 'react'
import { render, fireEvent } from '../testUtils'
import Index from '../../src/pages/index'
import * as redux from 'react-redux'
import store from 'store'

// const spy = jest.spyOn(redux, 'useSelector')
// spy.mockReturnValue({ username: 'test' })

function renderWithProvider(elem: JSX.Element, options: unknown) {
	return render(
		<redux.Provider store={store}>{elem}</redux.Provider>,
		options
	)
}

describe('Home page', () => {
	it('matches snapshot', () => {
		const { asFragment } = renderWithProvider(<Index />, {})
		expect(asFragment()).toMatchSnapshot()
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
