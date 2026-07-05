'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                  <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="p-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface QuantityControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
}

export function QuantityControl({ value, onChange, min = 0, max = 99, size = 'md' }: QuantityControlProps) {
  const isSm = size === 'sm'

  return (
    <div className="inline-flex items-center gap-0 bg-zinc-800/80 rounded-xl overflow-hidden border border-zinc-700/50">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
          isSm ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <svg className={cn(isSm ? 'w-3 h-3' : 'w-4 h-4')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <span className={cn(
        'font-semibold text-white text-center min-w-[36px] tabular-nums',
        isSm ? 'text-sm' : 'text-base'
      )}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
          isSm ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <svg className={cn(isSm ? 'w-3 h-3' : 'w-4 h-4')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}
