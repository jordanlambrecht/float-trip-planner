// app/components/PollResults.tsx

import type { PollResultsProps } from "@types"

const PollResults = ({
  results,
  votePreferences,
  onResetToForm,
}: PollResultsProps) => {
  const renderResultCell = (
    optionId: "option1" | "option2",
    preference: (typeof votePreferences)[0]
  ) => {
    const optionData = results[optionId]
    if (!optionData)
      return (
        <div className='p-2 text-xs text-center text-gray-textlight'>
          Data N/A
        </div>
      )

    const votesForThisPreference = optionData.votes[preference.value] || 0
    const totalVotesForOption = Object.values(optionData.votes).reduce(
      (sum, count) => sum + count,
      0
    )
    const percentage =
      totalVotesForOption > 0
        ? (votesForThisPreference / totalVotesForOption) * 100
        : 0

    const { barColor, textColor } = preference.resultCellConfig

    return (
      <div
        className={`relative p-3 border border-gray bg-gray-pagebg rounded-md overflow-hidden`}
      >
        <div
          className={`absolute top-0 left-0 h-full ${barColor} z-0`}
          style={{ width: `${percentage}%`, transition: "width 0.5s ease-out" }}
        ></div>

        {/* Content on top of bar */}
        <div className={`relative z-10 ${textColor}`}>
          <div className='font-mono text-sm font-semibold sm:text-base'>
            {votesForThisPreference} VOTES // {Math.round(percentage)}%
          </div>
          <div className='font-mono text-xs uppercase tracking-wider mt-0.5'>
            {preference.label}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 sm:space-y-8'>
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        {/* Column for Option 1 Results */}
        <div className='space-y-2 sm:space-y-3'>
          {votePreferences.map((pref) => (
            <div key={`option1-${pref.value}`}>
              {renderResultCell("option1", pref)}
            </div>
          ))}
        </div>

        {/* Column for Option 2 Results */}
        <div className='space-y-2 sm:space-y-3'>
          {votePreferences.map((pref) => (
            <div key={`option2-${pref.value}`}>
              {renderResultCell("option2", pref)}
            </div>
          ))}
        </div>
      </div>

      <div className='mt-6 text-center sm:mt-8'>
        <button
          onClick={onResetToForm}
          className='font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-6 border border-gray text-gray-textdark bg-gray-cardbg hover:bg-gray-pagebg hover:border-gray-textlight rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2'
        >
          &lt;- Cancel and Start Over
        </button>
      </div>
    </div>
  )
}

export default PollResults
