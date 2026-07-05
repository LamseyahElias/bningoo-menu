'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Bell,
  ArrowLeft,
  LogOut,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Package },
  confirmed: { label: 'Confirmed', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Clock },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  collected: { label: 'Collected', color: 'text-zinc-500', bg: 'bg-zinc-800', icon: Package },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
}

const KITCHEN_FLOW: Record<string, OrderStatus> = {
  confirmed: 'preparing',
  preparing: 'ready',
}

export default function KitchenPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'ready'>('active')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadOrders()
      // Auto-refresh every 15 seconds
      const interval = setInterval(loadOrders, 15000)
      return () => clearInterval(interval)
    }
  }, [user, authLoading])

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`*, items:order_items(*), user:users(*)`)
        .in('status', ['confirmed', 'preparing', 'ready', 'new'])
        .order('created_at', { ascending: true }) as unknown as { data: any }

      if (data) setOrders(data as unknown as Order[])
    } catch (err) {
      console.error('Error loading kitchen orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus } as unknown as never)
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.filter(o => o.id !== orderId))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      console.error('Error updating order:', err)
      toast.error('Failed to update order')
    }
  }

  const filteredOrders = activeFilter === 'all'
    ? orders
    : activeFilter === 'active'
      ? orders.filter(o => ['confirmed', 'preparing', 'new'].includes(o.status))
      : orders.filter(o => o.status === 'ready')

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading kitchen...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isStaff = user.role === 'kitchen' || user.role === 'staff' || user.role === 'admin'

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f13]/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Image src="/bningoo-logo.svg" alt="Bningoo" width={100} height={28} className="h-8 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-white">Kitchen</h1>
                <p className="text-xs text-zinc-500">
                  {orders.filter(o => ['confirmed', 'preparing', 'new'].includes(o.status)).length} active orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadOrders}
                className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-zinc-400" />
              </button>
              <Link href="/menu">
                <button className="p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </button>
              </Link>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'active', label: 'Active', count: orders.filter(o => ['confirmed', 'preparing', 'new'].includes(o.status)).length },
              { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
              { id: 'all', label: 'All', count: orders.length },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f.id
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs opacity-60">({f.count})</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center mb-6">
              <ChefHat className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {activeFilter === 'ready' ? 'No ready orders' : 'All clear!'}
            </h2>
            <p className="text-zinc-500 text-sm max-w-xs">
              {activeFilter === 'ready'
                ? 'Orders marked as ready will appear here for pickup.'
                : 'No active orders in the kitchen. New orders will appear automatically.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredOrders.map((order, i) => {
                const statusConfig = STATUS_CONFIG[order.status]
                const canAdvance = KITCHEN_FLOW[order.status]
                const isReady = order.status === 'ready'
                const isNew = order.status === 'new'

                const formatTimeSince = (dateStr: string) => {
                  const diff = Date.now() - new Date(dateStr).getTime()
                  const mins = Math.floor(diff / 60000)
                  if (mins < 1) return 'Just now'
                  if (mins < 60) return `${mins}m ago`
                  const hrs = Math.floor(mins / 60)
                  return `${hrs}h ${mins % 60}m ago`
                }

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    layout
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-2xl border overflow-hidden ${
                      isReady
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : isNew
                          ? 'border-blue-500/30 bg-blue-500/5'
                          : order.status === 'preparing'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-zinc-800/50 bg-zinc-900/60'
                    }`}
                  >
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-inherit/50">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${
                              isReady ? 'text-emerald-300' : isNew ? 'text-blue-300' : 'text-white'
                            }`}>
                              #{order.order_number?.slice(-5) || order.order_number}
                            </span>
                            {isNew && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {order.user?.full_name || 'Guest'}
                          </p>
                        </div>
                        <span className={`text-2xl font-bold ${
                          isReady ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">
                        {formatTimeSince(order.created_at)}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 space-y-1.5">
                      {order.items?.slice(0, 6).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-sm text-zinc-300 truncate">
                            {item.product?.name || item.formula?.name || 'Item'}
                          </span>
                          {item.customization && (
                            <span className="text-xs text-zinc-500 truncate">
                              ({JSON.stringify(item.customization).slice(0, 30)})
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items && order.items.length > 6 && (
                        <p className="text-xs text-zinc-600">
                          +{order.items.length - 6} more items
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="px-4 py-2 mx-4 mb-2 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                        <p className="text-xs text-zinc-500">Note: {order.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 pb-4 pt-2">
                      {canAdvance && (
                        <Button
                          variant={isNew ? 'accent' : 'accent'}
                          size="lg"
                          className="w-full h-12 text-base font-semibold"
                          onClick={() => updateOrderStatus(order.id, canAdvance)}
                        >
                          {isNew ? (
                            <>Accept Order</>
                          ) : order.status === 'confirmed' ? (
                            <><ChefHat className="w-4 h-4" /> Start Preparing</>
                          ) : (
                            <><CheckCircle className="w-4 h-4" /> Mark as Ready</>
                          )}
                        </Button>
                      )}
                      {isReady && (
                        <div className="flex items-center justify-center gap-2 py-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Ready for Pickup</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
