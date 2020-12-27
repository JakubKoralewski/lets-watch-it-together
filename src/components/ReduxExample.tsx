import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	decrement,
	increment,
	incrementAsync,
	incrementByAmount,
	reset,
	selectCount,
} from 'store/lib/exampleSlice'

export default function ReduxExample() {
	const dispatch = useDispatch()
	const count = useSelector(selectCount)
	const [incrementAmount, setIncrementAmount] = useState('2')

	function dispatchIncrement() {
		dispatch(increment())
	}

	function dispatchDecrement() {
		dispatch(decrement())
	}

	function dispatchReset() {
		dispatch(reset())
	}

	function changeIncrementAmount(event) {
		setIncrementAmount(event.target.value)
	}

	function dispatchIncrementByAmount() {
		dispatch(incrementByAmount(Number(incrementAmount) || 0))
	}

	function dispatchIncrementAsync() {
		dispatch(incrementAsync(Number(incrementAmount) || 0))
	}

	return (
		<>
			<div className="row">
				<button
					className="button"
					aria-label="Increment value"
					onClick={dispatchIncrement}
				>
					+
				</button>
				<span className="value">{count}</span>
				<button
					className="button"
					aria-label="Decrement value"
					onClick={dispatchDecrement}
				>
					-
				</button>
			</div>
			<div className="row">
				<input
					className="textbox"
					aria-label="Set increment amount"
					value={incrementAmount}
					onChange={changeIncrementAmount}
				/>
				<button className="button" onClick={dispatchIncrementByAmount}>
					Add Amount
				</button>
				<button className="button asyncButton" onClick={dispatchIncrementAsync}>
					Add Async
				</button>
			</div>
			<div className="row">
				<button className="button" onClick={dispatchReset}>
					Reset
				</button>
			</div>
		</>
	)
}
