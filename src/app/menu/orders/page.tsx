'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Badge, Dialog } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Clock,
  Package,
  ChefHat,
  CheckCircle,
  XCircle,
  MapPin,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bg: string
  icon: typeof Clock
}> = {
  cart: { label: 'Cart', color: 'text-zinc-400', bg: 'bg-zinc-800', icon: Clock },
  new: { label: 'Received', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Package },
  confirmed: { label: 'Confirmed', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  collected: { label: 'Collected', color: 'text-zinc-500', bg: 'bg-zinc-800', icon: Package },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
}

const STATUS_ORDER: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'collected']

function getStatusIndex(status: OrderStatus): number {
  const idx = STATUS_ORDER.indexOf(status)
  return idx >= 0 ? idx : -1
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadOrders()
    }
  }, [user, authLoading])

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`*, items:order_items(*), user:users(*), company:companies(*)`)
        .eq('user_id', user!.id)
        .neq('status', 'cart')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) setOrders(data as unknown as Order[])
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
    toast.success('Orders refreshed')
  }

  const getStatusColor = (status: OrderStatus) => {
    const config = STATUS_CONFIG[status]
    return config?.color || 'text-zinc-400'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13]">
        <div className="sticky top-0 z-40 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="px-4 py-4">
            <div className="skeleton h-8 w-32" />
          </div>
        </div>
        <div className="px-4 mt-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/menu">
            <button className="p-2 rounded-xl hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">My Orders</h1>
            <p className="text-xs text-zinc-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-3">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-xs">
              Your orders will appear here once you place them from the menu.
            </p>
            <Link href="/menu">
              <Button variant="accent" size="lg">
                Browse Menu
              </Button>
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            {orders.map((order, i) => {
              const statusConfig = STATUS_CONFIG[order.status]
              const StatusIcon = statusConfig?.icon || Clock
              const isActive = ['new', 'confirmed', 'preparing'].includes(order.status)
              const isCancelled = order.status === 'cancelled'

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left"
                  >
                    <Card hover className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">
                              #{order.order_number}
                            </span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            isCancelled ? 'danger' :
                            order.status === 'ready' ? 'success' :
                            isActive ? 'accent' : 'default'
                          }
                          dot
                        >
                          {statusConfig?.label || order.status}
                        </Badge>
                      </div>

                      {/* Items preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-zinc-400 truncate mr-2">
                                {item.quantity}x{' '}
                                {item.product?.name || item.formula?.name || 'Item'}
                              </span>
                              <span className="text-zinc-300 text-xs">
                                {formatCurrency(item.total_price)}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-zinc-500">
                              +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Status bar */}
                      {!isCancelled && (
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-zinc-800/50">
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                order.status === 'ready' ? 'bg-emerald-400' :
                                order.status === 'collected' ? 'bg-zinc-500' :
                                'bg-amber-400'
                              }`}
                              style={{
                                width: `${order.status === 'new' ? 20 :
                                        order.status === 'confirmed' ? 40 :
                                        order.status === 'preparing' ? 65 :
                                        order.status === 'ready' ? 100 :
                                        order.status === 'collected' ? 100 : 0}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {order.status === 'ready' ? 'Ready!' :
                             order.status === 'collected' ? 'Done' :
                             `${statusConfig?.label || 'Processing'}...`}
                          </span>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-zinc-800/50">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400">Order cancelled</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${statusConfig?.color}`} />
                          <span className="text-xs text-zinc-500">Tap for details</span>
                        </div>
                        <span className="text-amber-400 font-bold text-sm">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.order_number}` : ''}
      >
        {selectedOrder && <OrderDetail order={selectedOrder} />}
      </Dialog>
    </div>
  )
}

function OrderDetail({ order }: { order: Order }) {
  const isCancelled = order.status === 'cancelled'
  const currentIdx = getStatusIndex(order.status)

  return (
    <div className="space-y-5">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant={
            isCancelled ? 'danger' :
            order.status === 'ready' ? 'success' :
            ['new', 'confirmed', 'preparing'].includes(order.status) ? 'accent' : 'default'
          }
          size="md"
          dot
        >
          {STATUS_CONFIG[order.status]?.label || order.status}
        </Badge>
        <span className="text-sm text-zinc-500">{formatDate(order.created_at)}</span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="space-y-0">
          {STATUS_ORDER.map((status, i) => {
            const config = STATUS_CONFIG[status]
            const Icon = config.icon
            const isComplete = currentIdx > i
            const isCurrent = currentIdx === i
            const isFuture = currentIdx < i

            return (
              <div key={status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                    isCurrent ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30' :
                    'bg-zinc-800 text-zinc-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      isComplete ? 'bg-emerald-500/30' : 'bg-zinc-800'
                    }`} />
                  )}
                </div>
                <div className={`pb-6 ${isFuture ? 'opacity-40' : ''}`}>
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-amber-400' :
                    isComplete ? 'text-emerald-400' :
                    'text-zinc-500'
                  }`}>
                    {config.label}
                  </p>
                  {isCurrent && order.status === 'preparing' && (
                    <p className="text-xs text-zinc-500 mt-0.5">Being prepared in the kitchen</p>
                  )}
                  {isCurrent && order.status === 'ready' && (
                    <p className="text-xs text-emerald-400 mt-0.5">Ready for pickup!</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Order Cancelled</p>
            <p className="text-xs text-zinc-400">This order was cancelled and will not be fulfilled.</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Items</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">{item.quantity}x</span>
                <span className="text-sm text-white">{item.product?.name || item.formula?.name || 'Item'}</span>
              </div>
              <span className="text-sm text-amber-400 font-medium">
                {formatCurrency(item.total_price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="px-3 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-1">Notes</p>
          <p className="text-sm text-zinc-300">{order.notes}</p>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-white font-semibold">Total</span>
        <span className="text-amber-400 font-bold text-lg">{formatCurrency(order.total_amount)}</span>
      </div>

      {/* Payment Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${order.is_paid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className="text-sm text-zinc-400">
          {order.is_paid ? 'Paid' : 'Payment pending'}
        </span>
      </div>
    </div>
  )
}
