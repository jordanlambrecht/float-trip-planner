'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

// Animates height open/closed using the grid-rows 0fr/1fr trick (a smooth
// transition to auto height). Children stay mounted so the transition can run.
// Wrap the collapsible content; toggle `open`.
interface CollapseProps {
  open: boolean
  children: ReactNode
  className?: string
}

const Collapse = ({ open, children, className }: CollapseProps) => (
  <div
    className={clsx(
      'grid transition-[grid-template-rows] duration-300 ease-in-out',
      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      className
    )}
  >
    <div className='overflow-hidden'>{children}</div>
  </div>
)

export default Collapse
