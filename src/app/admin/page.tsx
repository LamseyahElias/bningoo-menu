'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Badge } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ChartBar,
  Settings,
  LogOut,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Search,
  Menu as MenuIcon,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Order, OrderItem, OrderStatus } from '@/types'

type AdminTab = 'orders' | 'menu' | 'users' | 'reports' | 'settings'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  confirmed: { label: 'Confirmed', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  preparing: { label: 'Preparing', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  collected: { label: 'Collected', color: 'text-zinc-500', bg: 'bg-zinc-800' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10' },
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<AdminTab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user && user.role !== 'admin' && user.role !== 'manager') {
      router.push('/menu')
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
        .neq('status', 'cart')
        .order('created_at', { ascending: false })
        .limit(50) as unknown as { data: any }

      if (data) setOrders(data as unknown as Order[])
    } catch (err) {
      console.error('Error loading orders:', err)
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

      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      toast.success(`Order status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating order:', err)
      toast.error('Failed to update order status')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isAdmin = user.role === 'admin' || user.role === 'manager'

  const navItems = [
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag, count: orders.filter(o => o.status === 'new' || o.status === 'confirmed').length },
    { id: 'menu' as AdminTab, label: 'Menu', icon: Package },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'reports' as AdminTab, label: 'Reports', icon: ChartBar },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f13] flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/50
        transform transition-transform duration-200 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-lg font-black text-black">B</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Bningoo</h1>
                <p className="text-xs text-zinc-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 lg:hidden"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {'count' in item && item.count && item.count > 0 ? (
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                  {item.count > 9 ? '9+' : item.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-400">
                {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user.full_name || 'Admin'}</p>
              <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut()
              router.push('/auth/signin')
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-zinc-800 transition-colors lg:hidden"
            >
              <MenuIcon className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white capitalize">{activeTab}</h1>
              <p className="text-xs text-zinc-500">
                {activeTab === 'orders' && 'Manage and track all orders'}
                {activeTab === 'menu' && 'Manage products, formulas, and categories'}
                {activeTab === 'users' && 'Manage users and permissions'}
                {activeTab === 'reports' && 'View sales and performance reports'}
                {activeTab === 'settings' && 'Configure system settings'}
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </header>

        <div className="p-4">
          {activeTab === 'orders' && <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} />}
          {activeTab === 'menu' && <MenuTab supabase={supabase} />}
          {activeTab === 'users' && <UsersTab supabase={supabase} />}
          {activeTab === 'reports' && <ReportsTab orders={orders} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  )
}

/* ────── Orders Tab ────── */
function OrdersTab({ orders, updateOrderStatus }: { orders: Order[]; updateOrderStatus: (id: string, status: OrderStatus) => void }) {
  const [filter, setFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const statusFilters = ['all', 'new', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled']

  const getNextStatus = (current: string): OrderStatus | null => {
    const flow: Record<string, OrderStatus> = {
      new: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'collected',
    }
    return flow[current] || null
  }

  const formatDateShort = (d: string) => {
    const date = new Date(d)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 opacity-60">
              ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No orders found</h2>
          <p className="text-zinc-500 text-sm">Orders will appear here once customers place them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredOrders.map(order => {
              const statusConfig = STATUS_CONFIG[order.status]
              const nextStatus = getNextStatus(order.status)
              const isTerminal = ['collected', 'cancelled'].includes(order.status)

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Card className={`p-3 ${expandedOrder === order.id ? 'border-amber-500/30' : ''}`}>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        {/* Status indicator */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig?.bg || 'bg-zinc-800'}`}>
                          <span className={`text-lg font-bold ${statusConfig?.color}`}>
                            {order.order_number?.slice(-3) || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-white">#{order.order_number}</span>
                            {!isTerminal && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">
                            {order.user?.full_name || 'Unknown'} • {formatDateShort(order.created_at)}
                          </p>
                        </div>

                        <Badge
                          variant={
                            order.status === 'cancelled' ? 'danger' :
                            order.status === 'ready' ? 'success' :
                            order.status === 'preparing' ? 'accent' :
                            order.status === 'collected' ? 'default' : 'info'
                          }
                          size="sm"
                        >
                          {statusConfig?.label || order.status}
                        </Badge>

                        <span className="text-amber-400 font-bold text-sm">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === order.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-4">
                          {/* Order Items */}
                          <div className="space-y-1.5">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Items</p>
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-zinc-300">
                                  {item.quantity}x {item.product?.name || item.formula?.name || 'Item'}
                                </span>
                                <span className="text-zinc-400">{formatCurrency(item.total_price)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Order Info */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-zinc-500">Customer</p>
                              <p className="text-zinc-300">{order.user?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-zinc-500">{order.company?.name || ''}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Time</p>
                              <p className="text-zinc-300">{formatDate(order.created_at)}</p>
                            </div>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="px-3 py-2 rounded-xl bg-zinc-800/30">
                              <p className="text-xs text-zinc-500 mb-0.5">Notes</p>
                              <p className="text-sm text-zinc-300">{order.notes}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {nextStatus && (
                              <Button
                                variant="accent"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, nextStatus)
                                }}
                              >
                                Move to {STATUS_CONFIG[nextStatus]?.label || nextStatus}
                              </Button>
                            )}
                            {!isTerminal && order.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:bg-red-500/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'cancelled')
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* ────── Menu Tab ────── */
function MenuTab({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [view, setView] = useState<'products' | 'formulas' | 'categories'>('products')

  return (
    <div className="max-w-4xl">
      <div className="flex gap-2 mb-6">
        {(['products', 'formulas', 'categories'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              view === v
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === 'products' && <MenuListView supabase={supabase} table="products" fields={['name', 'description', 'price', 'is_active']} />}
      {view === 'formulas' && <MenuListView supabase={supabase} table="formulas" fields={['name', 'description', 'price', 'is_active']} />}
      {view === 'categories' && <MenuListView supabase={supabase} table="categories" fields={['name', 'slug', 'sort_order', 'is_active']} />}
    </div>
  )
}

function MenuListView({ supabase, table, fields }: { supabase: ReturnType<typeof createClient>; table: string; fields: string[] }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [table])

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from(table as any)
        .select('*')
        .order('created_at', { ascending: false } as any) as unknown as { data: any }
      if (data) setItems(data)
    } catch (err) {
      console.error(`Error loading ${table}:`, err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No {table} found. Add some from the dashboard.</p>
        </div>
      ) : (
        items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-zinc-500">{item.name?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{item.name || 'Unnamed'}</p>
              {item.description && (
                <p className="text-xs text-zinc-500 truncate">{item.description}</p>
              )}
            </div>
            {item.price != null && (
              <span className="text-amber-400 font-semibold text-sm">{formatCurrency(item.price)}</span>
            )}
            {item.sort_order != null && (
              <span className="text-xs text-zinc-500">Order: {item.sort_order}</span>
            )}
            <Badge variant={item.is_active !== false ? 'success' : 'danger'} size="sm">
              {item.is_active !== false ? 'Active' : 'Inactive'}
            </Badge>
          </motion.div>
        ))
      )}
    </div>
  )
}

/* ────── Users Tab ────── */
function UsersTab({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false }) as unknown as { data: any }
      if (data) setUsers(data)
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-1.5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-amber-400" />
        <h2 className="text-base font-semibold text-white">{users.length} Users</h2>
      </div>
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No users yet.</p>
        </div>
      ) : (
        users.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-zinc-400">{u.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{u.full_name || 'Unknown'}</p>
              <p className="text-xs text-zinc-500 truncate">{u.email}</p>
            </div>
            <Badge
              variant={u.role === 'admin' ? 'accent' : u.role === 'manager' ? 'purple' : 'default'}
              size="sm"
            >
              {u.role || 'customer'}
            </Badge>
            <Badge variant={u.is_active !== false ? 'success' : 'danger'} size="sm">
              {u.is_active !== false ? 'Active' : 'Inactive'}
            </Badge>
          </motion.div>
        ))
      )}
    </div>
  )
}

/* ────── Reports Tab ────── */
function ReportsTab({ orders }: { orders: Order[] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)
  const activeOrders = orders.filter(o => ['new', 'confirmed', 'preparing'].includes(o.status)).length
  const completedOrders = orders.filter(o => ['ready', 'collected'].includes(o.status)).length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

  const stats = [
    { label: 'Total Orders', value: orders.length, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Orders', value: activeOrders, color: 'from-amber-500 to-orange-600' },
    { label: 'Completed', value: completedOrders, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Cancelled', value: cancelledOrders, color: 'from-red-500 to-red-600', negative: true },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.negative ? 'text-red-400' : 'text-white'}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <Card className="p-6">
        <p className="text-sm text-zinc-500 mb-1">Total Revenue</p>
        <p className="text-4xl font-bold text-amber-400">{formatCurrency(totalRevenue)}</p>
      </Card>

      {/* Recent Activity */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Recent Orders</h3>
        <div className="space-y-1.5">
          {orders.slice(0, 10).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">#{order.order_number}</span>
                <Badge
                  variant={
                    order.status === 'cancelled' ? 'danger' :
                    order.status === 'ready' ? 'success' :
                    order.status === 'preparing' ? 'accent' : 'default'
                  }
                  size="sm"
                >
                  {order.status}
                </Badge>
              </div>
              <span className="text-amber-400 font-semibold text-sm">{formatCurrency(order.total_amount)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ────── Settings Tab ────── */
function SettingsTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white mb-4">Account Settings</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-zinc-500">Company</p>
            <p className="text-white">Bningoo</p>
          </div>
          <div>
            <p className="text-zinc-500">Timezone</p>
            <p className="text-white">UTC (Default)</p>
          </div>
          <div>
            <p className="text-zinc-500">Order Prefix</p>
            <p className="text-white">BNG-</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-red-500/20">
        <h3 className="text-base font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Destructive actions that cannot be undone. Proceed with caution.
        </p>
        <Button variant="danger" size="sm">
          Delete Company Data
        </Button>
      </Card>
    </div>
  )
}
