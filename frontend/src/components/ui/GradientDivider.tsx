import { cn } from '@/utils/cn'

type Props = {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * Gradient divider for shell region seams only:
 * sidebar ↔ main, topbar ↔ main, main ↔ copilot aside.
 * Do NOT use on card/input/table/domain-capsule edges (those stay solid).
 */
export function GradientDivider({ orientation = 'horizontal', className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shrink-0 pointer-events-none',
        orientation === 'horizontal'
          ? 'h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08),transparent)]'
          : 'w-px self-stretch bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08),transparent)]',
        className,
      )}
    />
  )
}
