'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

// Centered dialog over a dim, blurred backdrop. Clicking the backdrop calls
// onClose; the card itself stops propagation. Renders nothing when closed.
interface ModalProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
}

const Modal = ({ open, onClose, children, className }: ModalProps) => {
  if (!open) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className={clsx(
          'w-full max-w-sm p-6 rounded-lg shadow-xl bg-cardbg border border-gray',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
