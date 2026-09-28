import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { CartProvider } from '@lib/cart/CartContext'
import App from './App'
import '@styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}> 
      <CartProvider>
        <App />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </QueryClientProvider>
  </StrictMode>
)
