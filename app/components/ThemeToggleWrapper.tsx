"use client"

import dynamic from "next/dynamic"

const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
})

export default function ThemeToggleWrapper() {
  return (
    <div className='fixed z-50 top-4 right-4'>
      <ThemeToggle />
    </div>
  )
}
