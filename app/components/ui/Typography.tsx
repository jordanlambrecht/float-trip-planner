import { ReactNode } from 'react'
import clsx from 'clsx'

// Standardized headings + muted body text. Sizes/weights/colors come from the
// theme so headings stop drifting between text-2xl/3xl and gray-textdark vs
// gray-textdark. Pass className to tweak spacing per use (e.g. a tight card
// title: <H2 className='mb-1'>), which overrides the global base margin.
interface TextProps {
  children: ReactNode
  className?: string
}

// Hero / page title.
export const H1 = ({ children, className }: TextProps) => (
  <h1
    className={clsx('font-sans text-5xl font-bold text-gray-textdark', className)}
  >
    {children}
  </h1>
)

// Section / card heading.
export const H2 = ({ children, className }: TextProps) => (
  <h2
    className={clsx('font-sans text-2xl font-bold text-gray-textdark', className)}
  >
    {children}
  </h2>
)

// Sub-heading.
export const H3 = ({ children, className }: TextProps) => (
  <h3
    className={clsx(
      'font-sans text-xl font-semibold text-gray-textdark',
      className
    )}
  >
    {children}
  </h3>
)

// The ubiquitous muted mono line (font-mono text-sm text-gray-textlight).
export const Muted = ({ children, className }: TextProps) => (
  <p className={clsx('font-mono text-sm text-gray-textlight', className)}>
    {children}
  </p>
)
