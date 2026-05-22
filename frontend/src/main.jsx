import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import {QueryClientProvider,QueryClient} from '@tanstack/react-query'

const queryClient = new QueryClient()   // we can do decalre a conditions

createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App /> 
    </QueryClientProvider>
)
