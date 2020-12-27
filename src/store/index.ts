import { configureStore } from '@reduxjs/toolkit'
// https://github.com/vercel/next.js/tree/canary/examples/with-redux-toolkit

import exampleReducer from './lib/exampleSlice'

export default configureStore({
  reducer: {
    counter: exampleReducer
  },
  devTools: true,
})