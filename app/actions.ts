// app/actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/database"
import { VotePreference, PollResultsData, ParticipantVote } from "@types"
import { tripOptionsStaticDetails } from "@pollConfig"

type PollSubmission = Omit<ParticipantVote, "id">

interface SubmitPollActionResult {
  success: boolean
  message?: string
  error?: string
}

export async function submitPollAction(
  submissions: PollSubmission[]
): Promise<SubmitPollActionResult> {
  try {
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return { success: false, error: "Invalid submission data." }
    }

    for (const submission of submissions) {
      const { name, option1Vote, option2Vote } = submission
      if (!name || name.trim() === "" || !option1Vote || !option2Vote) {
        console.warn("Skipping incomplete submission in action:", submission)
        return {
          success: false,
          error: `Incomplete data for submission: ${
            name || "Unnamed voter"
          }. All fields are required.`,
        }
      }
    }

    // If all submissions are valid, proceed to insert
    for (const submission of submissions) {
      const { name, option1Vote, option2Vote } = submission
      await query(
        "INSERT INTO responses (name, option_1_preference, option_2_preference) VALUES ($1, $2, $3)",
        [name, option1Vote, option2Vote]
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

    const pollResults: PollResultsData = {
      option1: {
        ...tripOptionsStaticDetails.option1,
        votes: formatResults(resultsOption1.rows),
      },
      option2: {
        ...tripOptionsStaticDetails.option2,
        votes: formatResults(resultsOption2.rows),
      },
    }
    return pollResults
  } catch (error) {
    console.error("Error fetching poll results action:", error)
    return { error: "Failed to fetch poll results." }
  }
}
