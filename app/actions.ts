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
  HistoricalYearData,
  ActualRsvpEntry,
  ActualRsvpFormData, // Import RSVPStatus
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
      // Validate RSVP status if needed, e.g., ensure it's one of 'yes', 'no'
      if (rsvp && !["yes", "no"].includes(rsvp)) {
        return { success: false, error: `Invalid RSVP status for ${name}.` }
      }
    }

    // If all submissions are valid, proceed to insert
    for (const submission of submissions) {
      const { name, option1Vote, option2Vote, rsvp, message } = submission // Add message
      await query(
        "INSERT INTO poll_responses (name, option_1_preference, option_2_preference, rsvp_status, year, message, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
        [name, option1Vote, option2Vote, rsvp, currentYear, message || null]
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
      FROM poll_responses 
      WHERE option_1_preference IS NOT NULL
      GROUP BY option_1_preference
    `)

    const resultsOption2 = await query(`
      SELECT 
        option_2_preference as preference, 
        COUNT(*) as count 
      FROM poll_responses 
      WHERE option_2_preference IS NOT NULL
      GROUP BY option_2_preference
    `)

    // Updated query to fetch RSVP data with messages
    const rsvpResults = await query(`
      SELECT 
        name, 
        rsvp_status,
        year,
        message,
        created_at as "createdAt"
      FROM poll_responses 
      WHERE name IS NOT NULL AND name <> '' AND rsvp_status IS NOT NULL
      ORDER BY created_at DESC
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

    // Format RSVP data with year and message
    const formattedRsvps: RsvpEntry[] = rsvpResults.rows.map((row: any) => ({
      name: row.name,
      rsvp: row.rsvp_status as RSVPStatus,
      year: parseInt(row.year, 10) || new Date().getFullYear(),
      message: row.message || null,
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

// New action for submitting actual RSVPs
export async function submitActualRsvpAction(
  formData: ActualRsvpFormData,
  groupId?: string // Optional group ID for relating entries
): Promise<SubmitPollActionResult & { groupId?: string }> {
  try {
    const {
      name,
      phone,
      rsvp_status,
      items_bringing,
      extra_items,
      needed_items,
      volunteer_roles,
      merrit_reservoir,
      message,
      allergies,
      note,
    } = formData

    if (!name || name.trim() === "" || !rsvp_status) {
      return { success: false, error: "Name and RSVP status are required." }
    }

    // Generate a new group ID if one wasn't provided (for the primary person)
    const finalGroupId = groupId || crypto.randomUUID()

    // Insert into actual_rsvps table with group_id and new fields
    await query(
      "INSERT INTO actual_rsvps (name, phone, rsvp_status, items_bringing, extra_items, needed_items, volunteer_roles, merrit_reservoir, message, allergies, note, group_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())",
      [
        name,
        phone || null,
        rsvp_status,
        JSON.stringify(items_bringing || []),
        JSON.stringify(extra_items || []),
        JSON.stringify(needed_items || []),
        JSON.stringify(volunteer_roles || []),
        merrit_reservoir || false,
        message || null,
        JSON.stringify(allergies || []),
        note || null,
        finalGroupId,
      ]
    )

    // Insert new items into the items table (from all three arrays)
    const allItems = [
      ...(items_bringing || []),
      ...(extra_items || []),
      ...(needed_items || []),
    ]

    if (allItems.length > 0) {
      for (const item of allItems) {
        await query(
          "INSERT INTO items (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [item]
        )
      }
    }

    // Submit comment if there's a message
    if (message && message.trim() !== "") {
      await query(
        "INSERT INTO comments (comment, commenter_name, date_created) VALUES ($1, $2, NOW())",
        [message.trim(), name]
      )
    }

    revalidatePath("/rsvp") // Revalidate the RSVP page
    revalidatePath("/") // Revalidate the main page if it shows RSVP data
    return {
      success: true,
      message: "RSVP submitted successfully!",
      groupId: finalGroupId,
    }
  } catch (error) {
    console.error("Error submitting RSVP action:", error)
    return { success: false, error: "Failed to submit RSVP." }
  }
}

// New action for getting actual RSVPs
export async function getActualRsvsAction(): Promise<
  ActualRsvpEntry[] | { error: string }
> {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        rsvp_status,
        phone,
        items_bringing,
        extra_items,
        needed_items,
        message,
        merrit_reservoir,
        volunteer_roles,
        group_id,
        year,
        created_at,
        updated_at
      FROM actual_rsvps 
      ORDER BY created_at DESC
    `)

    const rsvps: ActualRsvpEntry[] = result.rows.map((row: any) => {
      let items_bringing_parsed: string[] = []
      if (row.items_bringing) {
        if (typeof row.items_bringing === "string") {
          try {
            items_bringing_parsed = JSON.parse(row.items_bringing)
          } catch (e) {
            console.error(
              `Failed to parse items_bringing for row ID ${row.id}:`,
              row.items_bringing,
              e
            )
            // Keep items_bringing_parsed as []
          }
        } else if (typeof row.items_bringing === "object") {
          items_bringing_parsed = row.items_bringing // Assume it's already parsed
        } else {
          console.warn(
            `Unexpected type for items_bringing for row ID ${row.id}:`,
            typeof row.items_bringing
          )
        }
      }

      let volunteer_roles_parsed: string[] = []
      if (row.volunteer_roles) {
        if (typeof row.volunteer_roles === "string") {
          try {
            volunteer_roles_parsed = JSON.parse(row.volunteer_roles)
          } catch (e) {
            console.error(
              `Failed to parse volunteer_roles for row ID ${row.id}:`,
              row.volunteer_roles,
              e
            )
            // Keep volunteer_roles_parsed as []
          }
        } else if (typeof row.volunteer_roles === "object") {
          volunteer_roles_parsed = row.volunteer_roles // Assume it's already parsed
        } else {
          console.warn(
            `Unexpected type for volunteer_roles for row ID ${row.id}:`,
            typeof row.volunteer_roles
          )
        }
      }

      let extra_items_parsed: string[] = []
      if (row.extra_items) {
        if (typeof row.extra_items === "string") {
          try {
            extra_items_parsed = JSON.parse(row.extra_items)
          } catch (e) {
            console.error(
              `Failed to parse extra_items for row ID ${row.id}:`,
              row.extra_items,
              e
            )
          }
        } else if (typeof row.extra_items === "object") {
          extra_items_parsed = row.extra_items
        }
      }

      let needed_items_parsed: string[] = []
      if (row.needed_items) {
        if (typeof row.needed_items === "string") {
          try {
            needed_items_parsed = JSON.parse(row.needed_items)
          } catch (e) {
            console.error(
              `Failed to parse needed_items for row ID ${row.id}:`,
              row.needed_items,
              e
            )
          }
        } else if (typeof row.needed_items === "object") {
          needed_items_parsed = row.needed_items
        }
      }

      return {
        id: row.id,
        name: row.name,
        rsvp_status: row.rsvp_status as RSVPStatus,
        phone: row.phone,
        items_bringing: items_bringing_parsed,
        extra_items: extra_items_parsed,
        needed_items: needed_items_parsed,
        message: row.message,
        merrit_reservoir: row.merrit_reservoir || false,
        volunteer_roles: volunteer_roles_parsed,
        group_id: row.group_id,
        year: parseInt(row.year, 10) || new Date().getFullYear(),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    })

    return rsvps
  } catch (error: any) {
    console.error("Original error fetching actual RSVPs:", error) // Log the full error server-side
    let detailedErrorMessage = "Failed to fetch RSVPs."
    if (error && typeof error === "object" && "message" in error) {
      detailedErrorMessage += ` Details: ${error.message}`
    } else if (typeof error === "string") {
      detailedErrorMessage += ` Details: ${error}`
    }
    return { error: detailedErrorMessage }
  }
}

// New action to get predefined items
export async function getPredefinedItemsAction(): Promise<
  string[] | { error: string }
> {
  try {
    const result = await query("SELECT name FROM items ORDER BY name ASC")
    return result.rows.map((row: { name: string }) => row.name)
  } catch (error) {
    console.error("Error fetching predefined items:", error)
    return { error: "Failed to fetch predefined items." }
  }
}

// New action to submit comments
export async function submitCommentAction(
  comment: string,
  commenterName?: string
): Promise<SubmitPollActionResult> {
  try {
    if (!comment || comment.trim() === "") {
      return { success: false, error: "Comment cannot be empty." }
    }

    await query(
      "INSERT INTO comments (comment, commenter_name, date_created) VALUES ($1, $2, NOW())",
      [comment.trim(), commenterName?.trim() || null]
    )

    return { success: true, message: "Comment submitted successfully!" }
  } catch (error) {
    console.error("Error submitting comment:", error)
    return { success: false, error: "Failed to submit comment." }
  }
}

// New action to get comments from the comments table
export async function getCommentsAction(): Promise<
  | Array<{
      id: number
      comment: string
      commenter_name: string
      date_created: string
    }>
  | { error: string }
> {
  try {
    const result = await query(
      "SELECT id, comment, commenter_name, date_created FROM comments ORDER BY date_created DESC"
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { error: "Failed to fetch comments." }
  }
}

// New action to get historical roll call data
export async function getHistoricalRollCallAction(): Promise<
  Array<{ name: string; year: number }> | { error: string }
> {
  try {
    const result = await query(
      "SELECT name, year FROM historical_roll_call ORDER BY year DESC, name ASC"
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching historical roll call:", error)
    return { error: "Failed to fetch historical roll call." }
  }
}
