// app/components/BackToTop.tsx
"use client"

import { useState, useEffect } from "react"

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls past the fold (viewport height)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight

      setIsVisible(scrollTop > viewportHeight)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Check initial scroll position
    handleScroll()

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 
        bg-pink-dark text-white
        rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:bg-pink-dark/80 hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2
        ${
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
      aria-label='Back to top'
    >
      <span className='text-xl' role='img' aria-label='Up arrow'>
        ⬆️
      </span>
    </button>
  )
}

export default BackToTop
