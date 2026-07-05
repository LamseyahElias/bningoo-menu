'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Card, Button, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import type { Product, Formula, Category } from '@/types'

export default function CategoryPage() {
  const { slug } = useParams()
  const supabase = createClient()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategoryData()
  }, [slug])

  const loadCategoryData = async () => {
    try {
      const slugStr = slug as string

      if (slugStr === 'all') {
        setCategory({ id: 'all', name: 'All Items', slug: 'all', company_id: '', sort_order: 0, is_active: true })
      } else {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slugStr)
          .single() as unknown as { data: any; error: any }
        if (cat) {
          setCategory(cat as unknown as Category)
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', cat.id)
            .eq('is_active', true) as unknown as { data: any }
          if (prods) setProducts(prods as unknown as Product[])
        }
      }

      // Load all active formulas
      const { data: forms } = await supabase
        .from('formulas')
        .select('*')
        .eq('is_active', true) as unknown as { data: any }
      if (forms) setFormulas(forms as unknown as Formula[])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayItems = products.length > 0 ? products : formulas

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
          <h1 className="text-lg font-semibold text-white">
            {category?.name || 'Menu'}
          </h1>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No items in this category yet</p>
          </div>
        ) : (
          <AnimatedList>
            {(slug === 'all' ? [...formulas, ...products] : displayItems).map((item, i) => (
              <Link key={item.id} href={`/menu/product/${item.id}?type=${'code' in item ? 'formula' : 'product'}`}>
                <Card hover className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center border border-zinc-700/50">
                    <span className="text-xl">{item.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
                      {'code' in item && item.code && (
                        <Badge variant="default" size="sm">#{item.code}</Badge>
                      )}
                    </div>
                    {'description' in item && item.description && (
                      <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-400 font-semibold text-sm">
                        {formatCurrency(item.price)}
                      </span>
                      {'crispy_price' in item && item.crispy_price && (
                        <span className="text-xs text-zinc-500">Crispy: {formatCurrency(item.crispy_price)}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                  </div>
                </Card>
              </Link>
            ))}
          </AnimatedList>
        )}
      </div>
    </div>
  )
}

function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      {children}
    </motion.div>
  )
}
