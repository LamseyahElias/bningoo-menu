'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Card, Button, Badge, QuantityControl, Dialog } from '@/components/ui'
import { formatCurrency, generateOrderNumber } from '@/lib/utils'
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Location } from '@/types'

export default function CartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart()
  const supabase = createClient()

  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadLocations()
    }
  }, [user, authLoading])

  const loadLocations = async () => {
    try {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
      if (data) setLocations(data as Location[])
    } catch (err) {
      console.error('Error loading locations:', err)
    }
  }

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return

    setPlacingOrder(true)
    try {
      const orderNumber = generateOrderNumber()
      const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          company_id: user.company_id,
          user_id: user.id,
          location_id: selectedLocation || null,
          status: 'new',
          total_amount: totalAmount,
          notes: notes || null,
          is_paid: false,
        } as any)
        .select()
        .single() as unknown as { data: { id: string } | null; error: any }

      if (orderError) throw orderError
      if (!order) throw new Error('Failed to create order')

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.type === 'product' ? item.product?.id : null,
        formula_id: item.type === 'formula' ? item.formula?.id : null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        customization: item.customization ? JSON.stringify(item.customization) : null,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any)

      if (itemsError) throw itemsError

      // Clear cart and redirect
      clearCart()
      toast.success('Order placed!', {
        description: `Order #${orderNumber} has been submitted.`,
      })
      router.push('/menu/orders')
    } catch (err) {
      console.error('Error placing order:', err)
      toast.error('Failed to place order', {
        description: 'Please try again or contact support.',
      })
    } finally {
      setPlacingOrder(false)
      setShowConfirm(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="skeleton h-8 w-40" />
      </div>
    )
  }

  if (!user) return null

  // Location type — query from the database schema
  interface Location {
    id: string
    name: string
    address?: string
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/menu">
            <button className="p-2 rounded-xl hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">Your Cart</h1>
            <p className="text-xs text-zinc-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clearCart()
                toast.success('Cart cleared')
              }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-xs">
              Browse the menu and add items to get started on your order.
            </p>
            <Link href="/menu">
              <Button variant="accent" size="lg">
                Browse Menu
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-700/50">
                        <span className="text-lg font-bold text-zinc-500">
                          {(item.product?.name || item.formula?.name || '?').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-white text-sm truncate">
                              {item.product?.name || item.formula?.name || 'Item'}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant={item.type === 'formula' ? 'accent' : 'default'} size="sm">
                                {item.type === 'formula' ? 'Formula' : 'Product'}
                              </Badge>
                              {item.formula?.code && (
                                <span className="text-xs text-zinc-500">#{item.formula.code}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              removeItem(item.id)
                              toast.success('Item removed')
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                          </button>
                        </div>

                        {/* Customizations */}
                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="mt-2 text-xs text-zinc-500 space-y-0.5">
                            {Object.entries(item.customization).map(([key, val]) => (
                              <p key={key}>{key}: {val}</p>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <QuantityControl
                            value={item.quantity}
                            onChange={(q) => updateQuantity(item.id, q)}
                            size="sm"
                          />
                          <span className="text-amber-400 font-semibold text-sm">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Delivery Details */}
            <Card className="p-4 space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Delivery Details
              </h2>

              {/* Location Selector */}
              {locations.length > 0 && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Delivery Location</label>
                  <div className="space-y-1.5">
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                          selectedLocation === loc.id
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : 'bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedLocation === loc.id ? 'border-amber-400' : 'border-zinc-600'
                        }`}>
                          {selectedLocation === loc.id && (
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-white font-medium">{loc.name}</p>
                          {loc.address && (
                            <p className="text-xs text-zinc-500">{loc.address}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Order Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or dietary notes..."
                  rows={3}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all duration-200"
                />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Sticky Bottom Bar — Checkout */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f13]/95 backdrop-blur-xl border-t border-zinc-800/50 px-4 py-4"
        >
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Subtotal ({totalItems} items)</span>
              <span className="text-lg font-bold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="w-full h-13 text-base font-semibold"
              onClick={() => setShowConfirm(true)}
              loading={placingOrder}
            >
              {placingOrder ? (
                <>Placing Order...</>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Place Order — {formatCurrency(subtotal)}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Confirm Order Dialog */}
      <Dialog open={showConfirm} onClose={() => !placingOrder && setShowConfirm(false)} title="Confirm Order">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-zinc-300">
              Please review your order before submitting. Once placed, it cannot be modified.
            </p>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 truncate mr-2">
                  {item.quantity}x {item.product?.name || item.formula?.name}
                </span>
                <span className="text-white font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-amber-400 font-bold text-lg">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={placingOrder}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={handlePlaceOrder}
              loading={placingOrder}
            >
              {placingOrder ? 'Placing...' : 'Confirm & Place'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
