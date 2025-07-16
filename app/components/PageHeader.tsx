"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const PageHeader = () => {
  const pathname = usePathname()

  return (
    <section className='flex flex-col items-center justify-center p-4 sm:p-6 w-full'>
      <div className='py-2 my-4 text-center w-full'>
        <h1 className='text-5xl font-bold text-gray-textdark'>Niobrara 2025</h1>
        <h2 className='text-center my-1 italic font-semibold mx-0 text-gray-textdark'>
          AUGUST 21st-24th, 2025
        </h2>
        <span className='font-mono text-lg'>Hooray!</span>
      </div>

      {/* Navigation */}
      <nav className='flex gap-4 mt-4 '>
        <Link
          href='/'
          className={clsx(
            "font-mono text-sm px-4 py-2 rounded-md transition-colors",
            pathname === "/"
              ? "bg-pink-dark text-white"
              : "text-gray-textdark hover:bg-gray-100 border border-gray-textlight"
          )}
        >
          Home
        </Link>
        <Link
          href='/rsvp'
          className={clsx(
            "font-mono text-sm px-4 py-2 rounded-md transition-colors",
            pathname === "/rsvp"
              ? "bg-pink-dark text-white"
              : "text-gray-textdark hover:bg-gray-100 border border-gray-textlight"
          )}
        >
          RSVP
        </Link>
      </nav>
    </section>
  )
}

export default PageHeader
