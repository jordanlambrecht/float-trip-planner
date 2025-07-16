"use client"

import { useState, useEffect } from "react"

interface ItemTooltipProps {
  item: string
  rsvps: Array<{
    name: string
    extra_items?: string[]
    needed_items?: string[]
  }>
  children: React.ReactNode
  type: "need" | "extra" // Determines which direction to check
  isSelected?: boolean // Show tooltip when selected
  activeTooltip?: string | null // Currently active tooltip
  onTooltipChange?: (item: string | null) => void // Callback to change active tooltip
}

export function ItemTooltip({
  item,
  rsvps,
  children,
  type,
  isSelected = false,
  activeTooltip = null,
  onTooltipChange,
}: ItemTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [peopleWithItem, setPeopleWithItem] = useState<string[]>([])

  useEffect(() => {
    let people: string[] = []

    if (type === "need") {
      // Find people who have this item in their extra_items
      people = rsvps
        .filter((rsvp) => {
          const extraItems = rsvp.extra_items || []
          // Handle both direct matches and ride mapping
          if (item === "A Ride") {
            return extraItems.includes("Room in my car for carpooling")
          }
          return extraItems.includes(item)
        })
        .map((rsvp) => rsvp.name)
    } else {
      // Find people who need this item in their needed_items
      people = rsvps
        .filter((rsvp) => {
          const neededItems = rsvp.needed_items || []
          // Handle both direct matches and ride mapping
          if (item === "Room in my car for carpooling") {
            console.log(`Checking ${rsvp.name} for ride needs:`, neededItems)
            return neededItems.includes("A Ride")
          }
          return neededItems.includes(item)
        })
        .map((rsvp) => rsvp.name)
    }

    if (item === "Room in my car for carpooling") {
      console.log(`People who need rides for "${item}":`, people)
    }

    setPeopleWithItem(people)
  }, [item, rsvps, type])

  // Handle selection change - always call useEffect to maintain hook order
  useEffect(() => {
    if (isSelected && onTooltipChange) {
      onTooltipChange(item)
    }
  }, [isSelected, item, onTooltipChange])

  // Show tooltip on hover OR when selected AND this is the active tooltip
  const shouldShowTooltip =
    (showTooltip || (isSelected && activeTooltip === item)) &&
    peopleWithItem.length > 0

  // Don't show tooltip if no one has/needs the item
  if (peopleWithItem.length === 0) {
    return <>{children}</>
  }

  const handleMouseEnter = () => {
    setShowTooltip(true)
    onTooltipChange?.(item)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    onTooltipChange?.(null)
  }

  const isLeftSide = type === "extra"
  const headerColor = type === "extra" ? "text-red-300" : "text-green-300"

  return (
    <div
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {shouldShowTooltip && (
        <div
          className={`absolute z-50 pointer-events-none 
            ${/* Mobile: show above */ ""}
            sm:top-1/2 sm:transform sm:-translate-y-1/2
            ${/* Mobile: show above with bottom positioning */ ""}
            bottom-full mb-2
            ${/* Desktop: show left/right */ ""}
            sm:bottom-auto sm:mb-0
            ${
              isLeftSide
                ? "sm:right-full sm:mr-3 right-0"
                : "sm:left-full sm:ml-3 left-0"
            }`}
        >
          {/* Tooltip arrow */}
          <div
            className={`absolute z-50
              ${/* Mobile: arrow pointing down, centered */ ""}
              top-full left-1/2 transform -translate-x-1/2
              ${/* Desktop: arrow pointing left/right */ ""}
              sm:top-1/2 sm:left-auto sm:right-auto sm:transform sm:-translate-y-1/2
              ${
                isLeftSide
                  ? "sm:right-0 sm:translate-x-full"
                  : "sm:left-0 sm:-translate-x-full"
              }`}
          >
            <div
              className={`w-0 h-0
                ${/* Mobile: arrow pointing down */ ""}
                border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-gray-800
                ${/* Desktop: arrow pointing left/right */ ""}
                sm:border-l-0 sm:border-r-0 sm:border-t-[10px] sm:border-t-transparent sm:border-b-[10px] sm:border-b-transparent
                ${
                  isLeftSide
                    ? "sm:border-l-[10px] sm:border-l-gray-800"
                    : "sm:border-r-[10px] sm:border-r-gray-800"
                }`}
            ></div>
          </div>

          {/* Tooltip content */}
          <div className='bg-gray-800 text-white text-sm rounded-lg px-4 py-3 whitespace-nowrap shadow-xl border border-gray-700 max-w-xs'>
            <div className={`font-semibold mb-2 ${headerColor}`}>
              {(() => {
                // Special case headers for ride-related items
                if (type === "need" && item === "A Ride") {
                  return peopleWithItem.length === 1
                    ? "Can give rides:"
                    : "Can give rides:"
                }
                if (
                  type === "extra" &&
                  item === "Room in my car for carpooling"
                ) {
                  return peopleWithItem.length === 1
                    ? "Needs a ride:"
                    : "Need rides:"
                }
                // Default headers for other items
                return type === "need"
                  ? peopleWithItem.length === 1
                    ? "Has extra:"
                    : "Have extra:"
                  : peopleWithItem.length === 1
                  ? "Needs this:"
                  : "Need this:"
              })()}
            </div>
            <div className='space-y-1'>
              {peopleWithItem.map((person, index) => (
                <div key={index} className='text-gray-100 text-xs'>
                  • {person}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
