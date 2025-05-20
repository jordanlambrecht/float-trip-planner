import { PollForm, PollResults } from "@components"
import { PollViewSwitcherProps } from "@types"
import { DESIGN_VOTE_PREFERENCES } from "@pollConfig"

const PollViewSwitcher = ({
  view,
  pollResults,
  tripOptions,
  onFormSubmitSuccess,
  onResetToForm,
  error,
}: PollViewSwitcherProps) => {
  if (view === "form") {
    return (
      <PollForm
        tripOptions={tripOptions}
        votePreferences={DESIGN_VOTE_PREFERENCES}
        onFormSubmitSuccess={onFormSubmitSuccess}
      />
    )
  }

  if (pollResults) {
    return (
      <PollResults
        results={pollResults}
        votePreferences={DESIGN_VOTE_PREFERENCES}
        onResetToForm={onResetToForm}
      />
    )
  }

  return (
    <div className='py-10 text-center'>
      {error ? (
        <p className='font-mono text-red-600'>Error: {error}</p>
      ) : (
        <p className='font-mono text-gray-textlight'>Loading results...</p>
      )}
    </div>
  )
}

export default PollViewSwitcher
