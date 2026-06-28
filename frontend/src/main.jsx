import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' 
import App from './app/App'
import {QueryClientProvider,QueryClient} from '@tanstack/react-query'
import { queryClient } from './app/queryClient'
createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App /> 
    </QueryClientProvider>
)
