// app/components/Footer.tsx

import Link from "next/link"

const Footer = () => {
  return (
    <footer className='mt-8 mb-4 text-center'>
      <p className='font-mono text-xs text-gray-textlight dark:text-text-dm/75'>
        &copy; {new Date().getFullYear()},{" "}
        <Link href='https://jordanlambrecht.com' className='underline'>
          Jordy
        </Link>
        ,{" "}
        <Link
          href='https://github.com/jordanlambrecht/float-trip-planner'
          className='pl-0 ml-0 underline '
          target='_blank'
        >
          {` Fork —> `}
        </Link>
      </p>
    </footer>
  )
}

export default Footer
