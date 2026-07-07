'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, Badge, Input } from '@/components/ui'
import { useCart } from '@/hooks/useCart'
import { getGreeting, formatCurrency } from '@/lib/utils'
import { useCategories, useMenuItems } from '@/hooks/useMenu'
import type { MenuCategory, MenuItem } from '@/lib/services/menu-service'
import {
  Search,
  ShoppingCart,
  Clock,
  ChefHat,
  TrendingUp,
  ArrowRight,
  Star,
  Flame,
  User,
} from 'lucide-react'
import Link from 'next/link'

export default function MenuHome() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { totalItems } = useCart()
  const { categories, loading: catsLoading } = useCategories()
  const { items, loading: itemsLoading } = useMenuItems()

  const [searchQuery, setSearchQuery] = useState('')

  const dataLoading = catsLoading || itemsLoading

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Derive featured/popular from items
  const featuredItems = items.filter(i => i.badges.includes('chef_choice')).slice(0, 4)
  const popularItems = items.filter(i => i.badges.includes('best_seller')).slice(0, 6)
  const filteredItems = items.filter(i => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)
  })

  if (authLoading || dataLoading) {
    return <MenuSkeleton />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-4 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <p className="text-zinc-500 text-sm">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-white">
                {user?.full_name?.split(' ')[0] || 'Guest'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/menu/profile">
                <div className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors">
                  <User className="w-5 h-5 text-zinc-300" />
                </div>
              </Link>
              <Link href="/menu/cart">
                <div className="relative p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-zinc-300" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Input
              placeholder="Search menu items..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </div>

      <div className="px-4 space-y-8 mt-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        >
          {[
            { label: 'My Orders', icon: Clock, href: '/menu/orders', color: 'from-blue-500 to-blue-600' },
            { label: 'Today\'s Menu', icon: ChefHat, href: '/menu/category/all', color: 'from-amber-500 to-orange-600' },
            { label: 'Popular', icon: TrendingUp, href: '/menu/category/all', color: 'from-emerald-500 to-emerald-600' },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r ${action.color} bg-opacity-20 min-w-fit`}>
                <action.icon className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white whitespace-nowrap">{action.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <Link href="/menu/category/all" className="text-sm text-amber-400 flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/menu/category/${cat.slug || cat.id}`}>
                    <Card hover className="p-4 flex flex-col items-center text-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/10">
                        <span className="text-2xl">{cat.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-200">{cat.name}</span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Featured / Today's Specials */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Today's Specials
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            <AnimatePresence>
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="min-w-[240px]"
                >
                  <Link href={`/menu/product/${item.id}`}>
                    <Card hover className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-amber-500/20 via-zinc-800 to-zinc-900 flex items-center justify-center relative">
                        <div className="absolute top-3 left-3">
                          <Badge variant="accent" size="sm">
                            <Star className="w-3 h-3" /> Featured
                          </Badge>
                        </div>
                        <span className="text-4xl opacity-30">{item.name.charAt(0)}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-1 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Popular Items */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Popular Items</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {popularItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/menu/product/${item.id}`}>
                    <Card hover className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center border border-zinc-700/50">
                        <span className="text-xl">{item.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-amber-400 font-semibold text-sm">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50"
        >
          <Link href="/menu/cart">
            <div className="glass-strong rounded-2xl p-3 flex items-center justify-between shadow-2xl border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-zinc-400">View Cart</p>
                </div>
              </div>
              <Button variant="accent" size="sm">
                Checkout
              </Button>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f13] p-4">
      <div className="skeleton h-8 w-40 mb-6" />
      <div className="skeleton h-12 w-full mb-8" />
      <div className="flex gap-3 mb-8">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )
}
