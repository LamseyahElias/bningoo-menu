'use client'

import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1c1c26',
              border: '1px solid #2a2a38',
              color: '#f1f1f5',
              borderRadius: '12px',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
}
