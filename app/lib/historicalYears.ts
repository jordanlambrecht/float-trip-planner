import { getHistoricalYearsAction } from '../actions'
import type { HistoricalYearData } from '../types'

// WeatherForecast and HistoricalRollCall both need the (session-static)
// historical years table. Memoize the action so the two sibling components
// share one fetch instead of each firing its own DB round-trip. Failures are
// not cached, so a later mount can retry.
let cached: Promise<HistoricalYearData[] | { error: string }> | null = null

export const getHistoricalYearsCached = () => {
  if (!cached) {
    cached = getHistoricalYearsAction()
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
