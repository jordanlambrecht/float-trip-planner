// app/components/ThemeToggle.tsx
"use client"

import { useState, useEffect } from "react"

export default function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme) {
        return storedTheme
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return "light" // Default theme before client-side check
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      // Only set data-theme for dark mode, remove it for light mode
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark")
      } else {
        document.documentElement.removeAttribute("data-theme")
      }
      // Persist the theme choice in localStorage
      localStorage.setItem("theme", theme)
    }
  }, [theme, isMounted])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!isMounted) {
    // Render a placeholder to prevent layout shift
    return <div className='w-6 h-6 rounded-full sm:w-8 sm:h-8' />
  }

  return (
    <button
      onClick={toggleTheme}
      className='relative w-16 h-8 p-1 transition-colors duration-300 rounded-full shadow-inner bg-primary focus:outline-none focus:ring-2  focus:ring-pink-dark focus:ring-offset-2'
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <div className='relative flex items-center self-center justify-center w-full h-full mx-auto'>
        {/* Sun Icon */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className={`relative self-center z-50 h-4 w-4 text-yellow-400 transition-opacity duration-300 ease-in-out ${
            theme === "dark" ? "opacity-100" : "opacity-50"
          }`}
          fill='currentColor'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>

        {/* Moon Icon */}
        <div className='relative'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className={`z-50 h-4 w-4 text-gray-textdark transition-opacity duration-300 `}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
            />
          </svg>
        </div>
      </div>

      {/* Toggle Circle */}
      <div
        className={`absolute top-1 h-6 w-6 transform rounded-full bg-black shadow-md transition-transform duration-300 ease-in-out ${
          theme === "dark" ? "left-9" : "left-1"
        } floatAnimation`}
      />
    </button>
  )
}
