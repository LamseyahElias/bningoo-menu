'use client'

import { useState, useEffect } from 'react'
import { fetchCategories, fetchMenuItems, fetchMenuItemById, type MenuCategory, type MenuItem } from '@/lib/services/menu-service'

/**
 * Hook to fetch all menu categories
 */
export function useCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCategories()
      .then(data => { if (mounted) setCategories(data) })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return { categories, loading, error }
}

/**
 * Hook to fetch all menu items
 */
export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchMenuItems()
      .then(data => { if (mounted) setItems(data) })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return { items, loading, error }
}

/**
 * Hook to fetch a single menu item by ID
 */
export function useMenuItem(id: string | null) {
  const [item, setItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    fetchMenuItemById(id)
      .then(data => { if (mounted) setItem(data) })
      .catch(err => { if (mounted) setError(err.message) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  return { item, loading, error }
}
