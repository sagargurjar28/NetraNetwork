import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'
import React from 'react'
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'
export function Button({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  const baseCls = 'inline-flex items-center justify-center rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:opacity-50 disabled:pointer-events-none'
  const variants: Record<Variant, string> = {
    primary: 'bg-accent-primary text-white hover:bg-accent-hover active:bg-accent-muted shadow',
    secondary: 'bg-surface-3 text-text-primary hover:bg-surface-2 border border-[rgba(255,255,255,0.06)]',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
    danger: 'bg-accent-danger text-white hover:bg-accent-hover',
    outline: 'border border-accent-primary text-accent-hover hover:bg-accent-primary/10',
  }
  const sizes: Record<Size, string> = { sm: 'h-8 px-3 text-sm', md: 'h-9 px-4 text-sm', lg: 'h-11 px-6 text-base' }
  return <button className={cn(baseCls, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
    {loading && <Spinner size="sm" className="mr-2" />}{children}
  </button>
}
