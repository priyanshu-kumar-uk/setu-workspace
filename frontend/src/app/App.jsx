import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { LoadingProvider } from '../context/LoadingContext'
import GlobalLoader from '../components/ui/Loaders/GlobalLoader'

const App = () => {
  return (
    <LoadingProvider>
      <RouterProvider router={router} fallbackElement={<GlobalLoader fullScreen />} />
    </LoadingProvider>
  )
}
export default App