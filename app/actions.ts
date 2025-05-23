// app/actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { query } from "./lib/database"
import {
  VotePreference,
  PollResultsData,
  ParticipantVote,
  RSVPStatus,
  RsvpEntry,
  HistoricalYearData, // Import RSVPStatus
} from "./types"
import { tripOptionsStaticDetails } from "./pollConfig"

// Type for the submission data expected by the action
// Omit 'id' as it's client-side only. RSVP is now part of ParticipantVote.
type PollSubmission = Omit<ParticipantVote, "id">

interface SubmitPollActionResult {
  success: boolean
  message?: string
  error?: string
}

export async function submitPollAction(
  submissions: PollSubmission[]
): Promise<SubmitPollActionResult> {
  const currentYear = new Date().getFullYear()
  try {
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return { success: false, error: "Invalid submission data." }
    }

    for (const submission of submissions) {
      const { name, option1Vote, option2Vote, rsvp } = submission // Destructure rsvp
      if (
        !name ||
        name.trim() === "" ||
        !option1Vote ||
        !option2Vote
        // rsvp can be null initially, but let's assume it should be set by the time of submission
        // If rsvp is optional for submission, this validation might change
      ) {
        console.warn("Skipping incomplete submission in action:", submission)
        return {
          success: false,
          error: `Incomplete data for submission: ${
            name || "Unnamed voter"
          }. All fields (including RSVP) are required.`,
        }
      }
      // Validate RSVP status if needed, e.g., ensure it's one of 'yes', 'no', 'maybe'
      if (rsvp && !["yes", "no", "maybe"].includes(rsvp)) {
        return { success: false, error: `Invalid RSVP status for ${name}.` }
      }
    }

    // If all submissions are valid, proceed to insert
    for (const submission of submissions) {
      const { name, option1Vote, option2Vote, rsvp } = submission // Destructure rsvp
      await query(
        "INSERT INTO responses (name, option_1_preference, option_2_preference, rsvp_status, year) VALUES ($1, $2, $3, $4, $5)",
        [name, option1Vote, option2Vote, rsvp, currentYear]
      )
    }

    revalidatePath("/") // Revalidate the page to show new results
    return { success: true, message: "Poll submitted successfully!" }
  } catch (error) {
    console.error("Error submitting poll action:", error)
    return { success: false, error: "Failed to submit poll." }
  }
}

export async function getPollResultsAction(): Promise<
  PollResultsData | { error: string }
> {
  try {
    const resultsOption1 = await query(`
      SELECT 
        option_1_preference as preference, 
        COUNT(*) as count 
      FROM responses 
      WHERE option_1_preference IS NOT NULL
      GROUP BY option_1_preference
    `)

    const resultsOption2 = await query(`
      SELECT 
        option_2_preference as preference, 
        COUNT(*) as count 
      FROM responses 
      WHERE option_2_preference IS NOT NULL
      GROUP BY option_2_preference
    `)

    // Updated query to fetch RSVP data with year
    const rsvpResults = await query(`
      SELECT 
        name, 
        rsvp_status,
        year
      FROM responses 
      WHERE name IS NOT NULL AND name <> '' AND rsvp_status IS NOT NULL
      ORDER BY year DESC, name ASC
    `)

    const formatResults = (rows: any[]): Record<VotePreference, number> => {
      const votes: Record<VotePreference, number> = {
        works_best: 0,
        works_not_preferred: 0,
        idc: 0,
        doesnt_work: 0,
      }
      rows.forEach((row) => {
        if (votes.hasOwnProperty(row.preference)) {
          votes[row.preference as VotePreference] = parseInt(row.count, 10)
        }
      })

      return votes
    }

    // Format RSVP data with year
    const formattedRsvps: RsvpEntry[] = rsvpResults.rows.map((row: any) => ({
      name: row.name,
      rsvp: row.rsvp_status as RSVPStatus,
      year: parseInt(row.year, 10) || new Date().getFullYear(), // Default to current year if null
    }))

    const pollResults: PollResultsData = {
      option1: {
        ...tripOptionsStaticDetails.option1,
        votes: formatResults(resultsOption1.rows),
      },
      option2: {
        ...tripOptionsStaticDetails.option2,
        votes: formatResults(resultsOption2.rows),
      },
      rsvps: formattedRsvps,
    }
    return pollResults
  } catch (error) {
    console.error("Error fetching poll results action:", error)
    return { error: "Failed to fetch poll results." }
  }
}

export async function getHistoricalYearDataAction(
  year: number
): Promise<HistoricalYearData | { error: string }> {
  try {
    const result = await query(
      `
      SELECT 
        year,
        title,
        daytime_temps,
        evening_temps,
        moon_phase,
        sky_visibility,
        rain,
        wind,
        humidity,
        meteor_activity,
        notes,
        photo_album_url
      FROM years 
      WHERE year = $1
    `,
      [year]
    )

    if (result.rows.length === 0) {
      return { error: `No historical data found for year ${year}` }
    }

    const row = result.rows[0]
    const historicalData: HistoricalYearData = {
      year: row.year,
      title: row.title,
      daytimeTemps: row.daytime_temps,
      eveningTemps: row.evening_temps,
      moonPhase: row.moon_phase,
      skyVisibility: row.sky_visibility,
      rain: row.rain,
      wind: row.wind,
      humidity: row.humidity,
      meteorActivity: row.meteor_activity || [],
      notes: row.notes,
      photoAlbumUrl: row.photo_album_url,
    }

    return historicalData
  } catch (error) {
    console.error("Error fetching historical year data:", error)
    return { error: "Failed to fetch historical year data." }
  }
}
