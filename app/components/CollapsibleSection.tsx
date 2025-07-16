"use client"

import { useState } from "react"
import clsx from "clsx"

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
}

const CollapsibleSection = ({
  title,
  subtitle,
  children,
  defaultCollapsed = true,
  className = "",
}: CollapsibleSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className={clsx("w-full", className)}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className='w-full flex items-center justify-between p-4 border border-gray rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2 bg-none bg-transparent'
      >
        <div className='flex flex-col items-start'>
          <h3 className='line-through text-lg font-semibold text-gray-textdark'>
            {title}
          </h3>
          {subtitle && (
            <p className='text-sm text-gray-textlight mt-1'>{subtitle}</p>
          )}
        </div>
        <div className='flex items-center'>
          <span className='text-sm font-mono text-gray-textlight mr-2'>
            {isCollapsed ? "Show" : "Hide"}
          </span>
          <svg
            className={clsx(
              "w-5 h-5 text-gray-textlight transition-transform duration-200",
              isCollapsed ? "rotate-0" : "rotate-180"
            )}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </button>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "max-h-0" : "max-h-none"
        )}
      >
        <div
          className='border-x border-b border-blue-medium rounded-b-lg bg-transparent bg-none
        '
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSection
