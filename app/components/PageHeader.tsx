'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { TRIP_YEAR, TRIP_DATES_FULL } from '@tripConfig'

const PageHeader = () => {
  const pathname = usePathname()

  return (
    <section className='flex flex-col items-center justify-center p-4 sm:p-6 w-full'>
      <div className='py-2 my-4 text-center w-full'>
        <h1 className='text-5xl font-bold text-gray-textdark'>
          Niobrara {TRIP_YEAR}
        </h1>
        <h2 className='text-center my-1 italic font-semibold mx-0 text-gray-textdark'>
          {TRIP_DATES_FULL}
        </h2>
        <span className='font-mono text-lg'>Hooray!</span>
      </div>

      {/* Navigation */}
      <nav className='flex gap-4 mt-4 '>
        <Link
          href='/'
          className={clsx(
            'font-mono text-sm px-4 py-2 rounded-md transition-colors',
            pathname === '/'
              ? 'bg-pink-dark text-white'
              : 'text-gray-textdark hover:bg-gray-100 border border-gray-textlight'
          )}
        >
          HOME
        </Link>
        {pathname === '/rsvp' ? (
          <span
            aria-current='page'
            className='font-mono text-sm px-4 py-2 rounded-md bg-pink-dark text-white cursor-default'
          >
            RSVP
          </span>
        ) : (
          <Link
            href='/rsvp'
            className='font-mono text-sm px-4 py-2 rounded-md transition-colors text-gray-textdark hover:bg-gray-100 border border-gray-textlight'
          >
            RSVP
          </Link>
        )}
      </nav>
    </section>
  )
}

export default PageHeader
