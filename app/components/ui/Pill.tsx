import { ReactNode, DragEvent } from 'react'
import clsx from 'clsx'

// Small rounded-full chip used for gear / roles / status. Renders an
// interactive <button> when onClick is provided, otherwise a <span>.
// Encapsulates the repeated pill markup and theme color variants.
export type PillVariant =
  | 'teal'
  | 'pink'
  | 'blue'
  | 'orange'
  | 'green'
  | 'red'
  | 'neutral'
  | 'dashed'

const VARIANT: Record<PillVariant, string> = {
  teal: 'bg-teal-light text-teal-text border border-teal-medium',
  pink: 'bg-pink-light text-pink-text border border-pink-medium',
  blue: 'bg-blue-light text-blue-text border border-blue-medium',
  orange: 'bg-orange-light text-orange-text border border-orange-medium',
  green: 'bg-green-light text-green-text border border-green-medium',
  red: 'bg-red-light text-red-text border border-red-medium',
  neutral: 'text-gray-textlight border border-gray-textlight/60',
  dashed: 'text-gray-textlight border border-dashed border-gray-textlight/60',
}

interface PillProps {
  children: ReactNode
  variant?: PillVariant
  className?: string
  title?: string
  onClick?: () => void
  draggable?: boolean
  onDragStart?: (e: DragEvent<HTMLElement>) => void
}

const Pill = ({
  children,
  variant = 'neutral',
  className,
  title,
  onClick,
  draggable,
  onDragStart,
}: PillProps) => {
  const cls = clsx(
    'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-full transition-all',
    VARIANT[variant],
    onClick && 'cursor-pointer hover:scale-105',
    className
  )
  if (onClick) {
    return (
      <button
        type='button'
        className={cls}
        title={title}
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {children}
      </button>
    )
  }
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  )
}

export default Pill
