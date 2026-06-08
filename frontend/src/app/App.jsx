import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { LoadingProvider } from '../context/LoadingContext'
const App = () => {
  return (
    <LoadingProvider>
      <RouterProvider router={router} />
    </LoadingProvider>
  )
}
export default App