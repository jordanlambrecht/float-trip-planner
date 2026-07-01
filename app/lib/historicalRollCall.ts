import { getHistoricalRollCallAction } from '../actions'

// RsvpList (attendance-rank stars) and HistoricalRollCall both read the
// historical_roll_call archive. Memoize the action so the two sibling
// components share one fetch instead of each firing its own DB round-trip -
// mirrors getHistoricalYearsCached. Failures are not cached, so a later mount
// can retry.
type RollCall = Array<{ name: string; year: number }>

let cached: Promise<RollCall | { error: string }> | null = null

export const getHistoricalRollCallCached = () => {
  if (!cached) {
    cached = getHistoricalRollCallAction()
    cached
      .then((result) => {
        if (result && 'error' in result) cached = null
      })
      .catch(() => {
        cached = null
      })
  }
  return cached
}
