'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Card, Button, Badge, QuantityControl } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  ShoppingCart,
  Info,
  Plus,
  Check,
  ChefHat,
  Flame,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Product, Formula, FormulaItem, FormulaInclusion, OptionGroup } from '@/types'

export default function ProductDetailPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const itemType = searchParams.get('type') || 'product'
  const { user, loading: authLoading } = useAuth()
  const { addItem, totalItems } = useCart()
  const supabase = createClient()

  const [product, setProduct] = useState<Product | null>(null)
  const [formula, setFormula] = useState<Formula | null>(null)
  const [formulaItems, setFormulaItems] = useState<FormulaItem[]>([])
  const [inclusions, setInclusions] = useState<FormulaInclusion[]>([])
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const isFormula = itemType === 'formula' || 'code' in (product || {})
  const displayItem = formula || product

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadItemData()
    }
  }, [id, user, authLoading])

  const loadItemData = async () => {
    try {
      const idStr = id as string

      // Try loading as formula first
      const { data: f } = await supabase
        .from('formulas')
        .select('*')
        .eq('id', idStr)
        .single()

      if (f) {
        setFormula(f as Formula)
        // Load formula items (ingredients)
        const { data: items } = await supabase
          .from('formula_items')
          .select('*, product:products(*)')
          .eq('formula_id', idStr)
        if (items) setFormulaItems(items as FormulaItem[])

        // Load inclusions
        const { data: incs } = await supabase
          .from('formula_inclusions')
          .select('*')
          .eq('formula_id', idStr)
          .order('sort_order')
        if (incs) setInclusions(incs as FormulaInclusion[])

        // Load option groups
        const { data: opts } = await supabase
          .from('option_groups')
          .select('*, choices:option_choices(*)')
          .eq('is_active', true)
          .order('sort_order')
        if (opts) setOptionGroups(opts as unknown as OptionGroup[])
        return
      }

      // Fallback: load as product
      const { data: p } = await supabase
        .from('products')
        .select('*')
        .eq('id', idStr)
        .single()

      if (p) {
        setProduct(p as Product)
        // Load option groups for products too
        const { data: opts } = await supabase
          .from('option_groups')
          .select('*, choices:option_choices(*)')
          .eq('is_active', true)
          .order('sort_order')
        if (opts) setOptionGroups(opts as unknown as OptionGroup[])
      }
    } catch (err) {
      console.error('Error loading item:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!displayItem) return

    const unitPrice = isFormula && formula?.crispy_price ? formula.crispy_price : displayItem.price

    if (isFormula && formula) {
      addItem({
        type: 'formula',
        formula,
        unit_price: unitPrice,
        customization: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      }, quantity)
    } else if (product) {
      addItem({
        type: 'product',
        product,
        unit_price: unitPrice,
        customization: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      }, quantity)
    }

    toast.success('Added to cart!', {
      description: `${quantity}x ${displayItem.name} added to your order.`,
      action: {
        label: 'View Cart',
        onClick: () => router.push('/menu/cart'),
      },
    })
  }

  if (authLoading || loading) {
    return <DetailSkeleton />
  }

  if (!user) return null

  if (!displayItem) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Item not found</h2>
        <p className="text-zinc-500 text-sm mb-6">This item might have been removed or is unavailable.</p>
        <Link href="/menu">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-32">
      {/* Hero Image / Header */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-amber-500/20 via-zinc-800 to-zinc-900 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-orange-500 blur-3xl" />
        </div>

        {/* Back button */}
        <div className="relative z-10 p-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Item icon / image */}
        <div className="absolute bottom-6 left-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-4"
          >
            {displayItem.image_url ? (
              <img
                src={displayItem.image_url}
                alt={displayItem.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-zinc-500">{displayItem.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{displayItem.name}</h1>
                {isFormula && formula?.code && (
                  <Badge variant="default" size="sm">#{formula.code}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold text-xl">
                  {formatCurrency(isFormula && formula?.crispy_price ? formula.crispy_price : displayItem.price)}
                </span>
                {isFormula && formula?.crispy_price && (
                  <span className="text-sm text-zinc-500 line-through">
                    {formatCurrency(displayItem.price)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-20 space-y-6">
        {/* Description */}
        {displayItem.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4">
              <p className="text-zinc-400 text-sm leading-relaxed">{displayItem.description}</p>
            </Card>
          </motion.div>
        )}

        {/* Formula Items (Ingredients) */}
        {isFormula && formulaItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Ingredients</h2>
            </div>
            <div className="space-y-2">
              {formulaItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-800/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-zinc-500">{item.quantity}</span>
                  </div>
                  <span className="text-sm text-zinc-300">{item.product?.name || 'Item'}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Inclusions */}
        {isFormula && inclusions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-semibold text-white mb-3">Includes</h2>
            <div className="grid grid-cols-2 gap-2">
              {inclusions.map((inc, i) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">{inc.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Option Groups */}
        {optionGroups.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-base font-semibold text-white mb-3">Options</h2>
            <div className="space-y-4">
              {optionGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-zinc-300 font-medium">{group.name}</p>
                    {group.description && (
                      <span className="text-xs text-zinc-500">{group.description}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {group.choices?.map((choice) => {
                      const isSelected = selectedOptions[group.id] === choice.id
                      return (
                        <button
                          key={choice.id}
                          onClick={() => {
                            setSelectedOptions(prev => ({
                              ...prev,
                              [group.id]: choice.id,
                            }))
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/40 text-white'
                              : 'bg-zinc-800/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-sm">{choice.name}</span>
                          {choice.price_adjustment > 0 && (
                            <span className="text-xs text-amber-400">+{formatCurrency(choice.price_adjustment)}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Daily availability */}
        {isFormula && formula?.daily_available && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-400">
              Only {formula.daily_available} available today — order soon!
            </span>
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f13]/95 backdrop-blur-xl border-t border-zinc-800/50 px-4 py-4"
      >
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <QuantityControl
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
          />
          <Button
            variant="accent"
            size="lg"
            className="flex-1 h-13 text-base font-semibold"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart — {formatCurrency(
              (isFormula && formula?.crispy_price ? formula.crispy_price : displayItem.price) * quantity
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <div className="h-64 sm:h-80 skeleton" />
      <div className="px-4 -mt-4 relative z-20 space-y-4">
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
      </div>
    </div>
  )
}
