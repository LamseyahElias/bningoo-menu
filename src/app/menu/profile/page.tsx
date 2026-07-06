'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Phone,
  Calendar,
  LogOut,
  Shield,
  ChevronRight,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const supabase = createClient()
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadProfile()
    }
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .neq('status', 'cart')
      if (count !== null) setOrderCount(count)
    } catch {}
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
    toast.success('Signed out successfully')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const menuItems = [
    {
      label: 'My Orders',
      description: `${orderCount} order${orderCount !== 1 ? 's' : ''}`,
      icon: ShoppingBag,
      href: '/menu/orders',
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Account Settings',
      description: 'Email, password, preferences',
      icon: Settings,
      href: '#',
      color: 'from-zinc-800/50 to-zinc-900/50',
      iconColor: 'text-zinc-400',
    },
    {
      label: 'Help & Support',
      description: 'FAQs and contact us',
      icon: HelpCircle,
      href: '#',
      color: 'from-zinc-800/50 to-zinc-900/50',
      iconColor: 'text-zinc-400',
    },
    {
      label: 'Send Feedback',
      description: 'Help us improve Bningoo',
      icon: MessageCircle,
      href: '#',
      color: 'from-zinc-800/50 to-zinc-900/50',
      iconColor: 'text-zinc-400',
    },
  ]

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
          <h1 className="text-lg font-semibold text-white">Profile</h1>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* User Avatar / Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/20">
            <span className="text-4xl font-black text-black">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{user.full_name || 'User'}</h2>
          <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={user.role === 'admin' ? 'accent' : 'default'} size="sm" dot>
              {user.role || 'customer'}
            </Badge>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Card className="p-4 space-y-4">
            {user.full_name && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Full Name</p>
                  <p className="text-sm text-white">{user.full_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm text-white">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Phone</p>
                  <p className="text-sm text-white">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Role</p>
                <p className="text-sm text-white capitalize">{user.role || 'customer'}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Menu Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          {menuItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <Link href={item.href}>
                <Card hover className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center border border-zinc-800`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </motion.div>

        {/* Version */}
        <p className="text-center text-xs text-zinc-600 pb-8">
          Bningoo v0.1.0 · Part of Lamseyah Corporation
        </p>
      </div>
    </div>
  )
}
