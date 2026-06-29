// app/tripConfig.ts
// Single source of truth for the current season's year and dates.
// Season turnover checklist:
//   1. Update the constants below (plus the .ics files in /public).
//   2. Run `pnpm migrate:season` to archive the previous year's data
//      (years table + historical_roll_call) — past years are always kept
//      as historical records, never deleted.

export const TRIP_YEAR = 2026
export const PREVIOUS_TRIP_YEAR = 2025

// The year the pre-RSVP date poll ran. It happens to equal
// PREVIOUS_TRIP_YEAR right now, but they are different concepts: the poll
// display is permanently a 2025 artifact, while PREVIOUS_TRIP_YEAR advances
// every season.
export const POLL_YEAR = 2025

// Core weekend is Fri-Sun; Thursday is the optional Merritt Reservoir bonus day.
// 2026: the ideal Perseids-peak/new-moon window (Aug 12-13) lost to a wedding
// on Friday Aug 14, and the Aug 27-30 eclipse weekend is washed out by a full
// moon. Aug 20-23 gives fully dark skies after moonset every night.
export const TRIP_DATES_FULL = 'AUGUST 20th-23rd, 2026'
export const TRIP_DATES_SHORT = 'AUG 20th - 23rd'
export const TRIP_DATES_NO_YEAR = 'August 20th-23rd'

// Previous trip, displayed in historical/archived contexts.
export const PREVIOUS_TRIP_DATES_NO_YEAR = 'August 21st-24th'

export const TRIP_DAYS = {
  bonus: 'AUG 20', // Thursday - Merritt Reservoir
  day1: 'AUG 21', // Friday - arrive + camp
  day2: 'AUG 22', // Saturday - float
  day3: 'AUG 23', // Sunday - head home
}

// The "maybe" RSVP options disappear at the start of the last week of July
// (midnight Central) - from then on it's commit or decline. Enforced in the
// form UI and again in the submit server action.
export const MAYBE_OPTIONS_CUTOFF = new Date('2026-07-25T00:00:00-05:00')
export const MAYBE_OPTIONS_CUTOFF_LABEL = 'July 25th'

// Existing maybes have until this date to flip to Coming / Can't Make It.
export const MAYBE_DECISION_DEADLINE_LABEL = 'Aug 1'

// Payments
export const VENMO_USERNAME = 'Jordan-Lambrecht'
export const VENMO_DISPLAY_NAME = 'Jordy'
export const VENMO_PROFILE_URL = `https://account.venmo.com/u/${VENMO_USERNAME}`

// Spotify playlist for the trip. Set to the full open.spotify.com playlist
// URL once it exists - the playlist section stays hidden while this is null.
export const SPOTIFY_PLAYLIST_URL: string | null =
  'https://open.spotify.com/playlist/7vWr7kkabRkV2qFrxGIIib?si=bea383eab7a3425b&pt=81b2a8f64449f1632de1816e733a522e'

// Valentine, NE - used by the weather forecast and star chart embeds.
export const TRIP_COORDS = { lat: 42.8736, lon: -100.5503 }
// The real trip dates. Until ~early August these are outside Open-Meteo's
// ~16-day window, so the forecast shows placeholder cards + the countdown;
// it switches to live data automatically once the window opens.
export const TRIP_FORECAST_START = '2026-08-20'
export const TRIP_FORECAST_END = '2026-08-23'
