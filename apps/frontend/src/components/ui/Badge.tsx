import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'info' | 'destructive'
type BadgeTone = 'solid' | 'soft'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, Record<BadgeVariant, string>> = {
  solid: {
    neutral: 'bg-muted text-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    info: 'bg-info text-info-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  },
  soft: {
    neutral: 'bg-muted text-foreground',
    success: 'bg-success/15 text-success border border-success/40',
    warning: 'bg-warning/15 text-warning border border-warning/40',
    info: 'bg-info/15 text-info border border-info/40',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/40',
  },
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, children, variant = 'neutral', tone = 'solid', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1.5 text-sm font-semibold leading-tight',
        'shadow-token-sm',
        toneClasses[tone][variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
Badge.displayName = 'Badge'