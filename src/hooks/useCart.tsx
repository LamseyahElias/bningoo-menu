'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CartItem, Product, Formula } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bningoo-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bningoo-cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i =>
        i.type === item.type &&
        (item.product ? i.product?.id === item.product.id : i.formula?.id === item.formula?.id)
      )
      if (existing) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      const newItem: CartItem = {
        ...item,
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        quantity,
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
