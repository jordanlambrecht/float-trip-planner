import { useState, useEffect } from "react"
import type { HistoricalYearData, TripOptionDetails } from "@types"
import { getHistoricalYearDataAction } from "@actions"

interface YearComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  currentYear: number
  currentYearData: {
    option1: TripOptionDetails
    option2: TripOptionDetails
  }
}

const YearComparisonModal = ({
  isOpen,
  onClose,
  currentYear,
}: YearComparisonModalProps) => {
  const [historicalData, setHistoricalData] =
    useState<HistoricalYearData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previousYear = currentYear - 1

  useEffect(() => {
    if (isOpen) {
      fetchHistoricalData()
    }
  }, [isOpen, previousYear])

  const fetchHistoricalData = async () => {
    setIsLoading(true)
    setError(null)

    const result = await getHistoricalYearDataAction(previousYear)

    if ("error" in result) {
      setError(result.error)
      setHistoricalData(null)
    } else {
      setHistoricalData(result)
    }

    setIsLoading(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 space-y-4 border rounded-lg shadow-xl bg-cardbg  border-gray-300 '>
        {/* Header */}
        <div className='flex items-center justify-between pb-4 border-b border-gray-300 '>
          <div className='flex items-center'>
            <h2 className='text-2xl font-bold font-kumbh-sans text-gray-textdark '>
              Compare {currentYear} to Previous Trips
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-textlight hover:text-gray-textdark :text-gray-textlight rounded-full hover:bg-gray-100 :bg-gray-700'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isLoading && (
          <div className='py-8 text-center'>
            <p className='font-mono text-gray-textlight'>
              Loading {previousYear} historical data...
            </p>
          </div>
        )}

        {error && (
          <div className='py-8 text-center'>
            <p className='font-mono text-red-600'>Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && historicalData && (
          <div className='space-y-8'>
            {/* Historical Data Section */}
            <div className=' pt-8'>
              <div className='p-6 bg-gray-50  rounded-lg border border-gray-200 '>
                {/* Historical Trip Header */}
                <div className='text-center mb-6'>
                  <p className='font-sans text-xs tracking-wider uppercase text-text '>
                    Historical Data
                  </p>
                  <h2 className='text-3xl font-bold text-text  mt-1'>
                    {historicalData.title}
                  </h2>
                </div>

                {/* Historical Data Details */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <h4 className='font-semibold font-mono text-sm text-gray-textdark '>
                      Weather Conditions
                    </h4>
                    <div className='space-y-2 text-sm font-mono'>
                      {historicalData.daytimeTemps && (
                        <div>
                          <span className='text-gray-textlight'>Daytime:</span>{" "}
                          {historicalData.daytimeTemps}
                        </div>
                      )}
                      {historicalData.eveningTemps && (
                        <div>
                          <span className='text-gray-textlight'>Evening:</span>{" "}
                          {historicalData.eveningTemps}
                        </div>
                      )}
                      {historicalData.wind && (
                        <div>
                          <span className='text-gray-textlight'>Wind:</span>{" "}
                          {historicalData.wind}
                        </div>
                      )}
                      {historicalData.humidity && (
                        <div>
                          <span className='text-gray-textlight'>Humidity:</span>{" "}
                          {historicalData.humidity}
                        </div>
                      )}
                      {historicalData.rain && (
                        <div>
                          <span className='text-gray-textlight'>Rain:</span>{" "}
                          {historicalData.rain}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <h4 className='font-semibold font-mono text-sm text-gray-textdark '>
                      Sky Conditions
                    </h4>
                    <div className='space-y-2 text-sm font-mono'>
                      {historicalData.moonPhase && (
                        <div>
                          <span className='text-gray-textlight'>Moon:</span>{" "}
                          {historicalData.moonPhase}
                        </div>
                      )}
                      {historicalData.skyVisibility && (
                        <div>
                          <span className='text-gray-textlight'>
                            Visibility:
                          </span>{" "}
                          {historicalData.skyVisibility}
                        </div>
                      )}
                      {historicalData.meteorActivity &&
                        historicalData.meteorActivity.length > 0 && (
                          <div>
                            <span className='text-gray-textlight'>
                              Meteors:
                            </span>{" "}
                            {historicalData.meteorActivity.join(", ")}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {historicalData.notes && (
                  <div className='mt-6 pt-4 border-t border-gray-200 '>
                    <h4 className='font-semibold font-mono text-sm text-gray-textdark  mb-2'>
                      Notes
                    </h4>
                    <p className='text-sm text-gray-textdark  whitespace-pre-wrap'>
                      {historicalData.notes}
                    </p>
                  </div>
                )}

                {historicalData.photoAlbumUrl && (
                  <div className='mt-4 pt-4 border-t border-gray-200 '>
                    <a
                      href={historicalData.photoAlbumUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center px-3 py-2 text-sm font-mono text-pink-dark  border border-pink-dark  rounded-md hover:bg-pink-dark hover:text-white :bg-pink-light :text-gray-textdark transition-colors'
                    >
                      📸 View Photos
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='flex justify-end pt-4 border-t border-gray-300 '>
          <button
            onClick={onClose}
            className='px-4 py-2 font-mono text-sm text-white rounded bg-pink-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default YearComparisonModal
