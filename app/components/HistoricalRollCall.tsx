"use client"

import { useState, useEffect } from "react"
import { getHistoricalRollCallAction } from "@actions"

interface HistoricalEntry {
  name: string
  year: number
}

interface HistoricalRollCallProps {
  // We'll fetch the data within the component
}

// Helper function to initialize last names (first letter only)
const formatNameWithInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) {
    return name // No last name to initialize
  }

  const firstName = parts[0]
  const lastNameInitial = parts[parts.length - 1][0].toUpperCase()

  return `${firstName} ${lastNameInitial}.`
}

// Helper function to group entries by year
const groupEntriesByYear = (
  entries: HistoricalEntry[]
): Record<number, HistoricalEntry[]> => {
  return entries.reduce((groups, entry) => {
    const year = entry.year
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(entry)
    return groups
  }, {} as Record<number, HistoricalEntry[]>)
}

const HistoricalRollCall = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const data = await getHistoricalRollCallAction()
        if ("error" in data) {
          setError(data.error)
        } else {
          setHistoricalData(data)
        }
      } catch (err) {
        setError("Failed to load historical roll call data")
        console.error("Error fetching historical data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [])

  if (loading) {
    return (
      <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl font-bold mb-4'>Historical Roll Call</h2>
          <p className='text-center font-mono text-gray-500 py-8'>
            Loading historical data...
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl font-bold mb-4'>Historical Roll Call</h2>
          <p className='text-center font-mono text-red-500 py-8'>{error}</p>
        </div>
      </section>
    )
  }

  if (!historicalData || historicalData.length === 0) {
    return null
  }

  const currentYear = new Date().getFullYear()

  // Group entries by year
  const entriesByYear = groupEntriesByYear(historicalData)

  // Get years in descending order, excluding current year
  const years = Object.keys(entriesByYear)
    .map(Number)
    .filter((year) => year < currentYear)
    .sort((a, b) => b - a) // Descending order

  if (years.length === 0) {
    return null
  }

  return (
    <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
      <div className='max-w-4xl mx-auto flex flex-col gap-y-12'>
        {years.map((year) => {
          const yearEntries = entriesByYear[year]

          return (
            <div key={year} className='mb-8'>
              <h2 className='text-2xl font-bold mb-4'>{year} Roll Call</h2>

              <div className='w-full'>
                <ul className='grid grid-cols-2 w-full sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'>
                  {yearEntries.map((entry, index) => (
                    <li
                      key={`${year}-${index}`}
                      className='flex items-center justify-between p-3 border-b border-green-500'
                    >
                      <p className='font-mono text-base font-medium text-gray-textdark truncate text-wrap pr-2'>
                        {formatNameWithInitials(entry.name)}
                      </p>
                      <span className='text-lg flex-shrink-0'>✅</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HistoricalRollCall
