// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { query } from './lib/database'
import {
  VotePreference,
  PollResultsData,
  ParticipantVote,
  RSVPStatus,
  RsvpEntry,
  HistoricalYearData,
  ActualRsvpEntry,
  ActualRsvpFormData, // Import RSVPStatus
  SpotifyPlaylist,
} from './types'
import { tripOptionsStaticDetails } from './pollConfig'
import {
  TRIP_YEAR,
  POLL_YEAR,
  MAYBE_OPTIONS_CUTOFF,
  MAYBE_OPTIONS_CUTOFF_LABEL,
  SPOTIFY_PLAYLIST_URL,
} from './tripConfig'
import { MAYBE_RSVP_STATUSES } from './types'

// Type for the submission data expected by the action
// Omit 'id' as it's client-side only. RSVP is now part of ParticipantVote.
type PollSubmission = Omit<ParticipantVote, 'id'>

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
      return { success: false, error: 'Invalid submission data.' }
    }

    for (const submission of submissions) {
      const { name, option1Vote, option2Vote, rsvp } = submission // Destructure rsvp
      if (
        !name ||
        name.trim() === '' ||
        !option1Vote ||
        !option2Vote
        // rsvp can be null initially, but let's assume it should be set by the time of submission
        // If rsvp is optional for submission, this validation might change
      ) {
        console.warn('Skipping incomplete submission in action:', submission)
        return {
          success: false,
          error: `Incomplete data for submission: ${
            name || 'Unnamed voter'
          }. All fields (including RSVP) are required.`,
        }
      }
      // Validate RSVP status if needed, e.g., ensure it's one of 'yes', 'no'
      if (rsvp && !['yes', 'no'].includes(rsvp)) {
        return { success: false, error: `Invalid RSVP status for ${name}.` }
      }
    }

    // If all submissions are valid, proceed to insert
    for (const submission of submissions) {
      const { name, option1Vote, option2Vote, rsvp, message } = submission // Add message
      await query(
        'INSERT INTO poll_responses (name, option_1_preference, option_2_preference, rsvp_status, year, message, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [name, option1Vote, option2Vote, rsvp, currentYear, message || null]
      )
    }

    revalidatePath('/') // Revalidate the page to show new results
    return { success: true, message: 'Poll submitted successfully!' }
  } catch (error) {
    console.error('Error submitting poll action:', error)
    return { success: false, error: 'Failed to submit poll.' }
  }
}

export async function getPollResultsAction(): Promise<
  PollResultsData | { error: string }
> {
  try {
    // The poll is a closed artifact of the year it ran, so results are
    // pinned to that year even after newer rows appear in the table.
    const resultsOption1 = await query(
      `
      SELECT
        option_1_preference as preference,
        COUNT(*) as count
      FROM poll_responses
      WHERE option_1_preference IS NOT NULL AND year = $1
      GROUP BY option_1_preference
    `,
      [POLL_YEAR]
    )

    const resultsOption2 = await query(
      `
      SELECT
        option_2_preference as preference,
        COUNT(*) as count
      FROM poll_responses
      WHERE option_2_preference IS NOT NULL AND year = $1
      GROUP BY option_2_preference
    `,
      [POLL_YEAR]
    )

    // Updated query to fetch RSVP data with messages
    const rsvpResults = await query(
      `
      SELECT
        name,
        rsvp_status,
        year,
        message,
        created_at as "createdAt"
      FROM poll_responses
      WHERE name IS NOT NULL AND name <> '' AND rsvp_status IS NOT NULL
        AND year = $1
      ORDER BY created_at DESC
    `,
      [POLL_YEAR]
    )

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
    console.error('Error fetching poll results action:', error)
    return { error: 'Failed to fetch poll results.' }
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
    console.error('Error fetching historical year data:', error)
    return { error: 'Failed to fetch historical year data.' }
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

    if (!name || name.trim() === '' || !rsvp_status) {
      return { success: false, error: 'Name and RSVP status are required.' }
    }

    // Maybe RSVPs close the last week of July - after that it's commit or
    // decline. The form hides the options too; this is the backstop.
    if (
      MAYBE_RSVP_STATUSES.includes(rsvp_status) &&
      new Date() >= MAYBE_OPTIONS_CUTOFF
    ) {
      return {
        success: false,
        error: `Maybe RSVPs closed ${MAYBE_OPTIONS_CUTOFF_LABEL} - time to commit! Please pick "Coming" or "Can't Make It".`,
      }
    }

    // Generate a new group ID if one wasn't provided (for the primary person)
    const finalGroupId = groupId || crypto.randomUUID()

    // Insert into actual_rsvps table with group_id and new fields.
    // Year is set explicitly so RSVPs are always tagged to the current
    // season rather than relying on a DB column default.
    await query(
      'INSERT INTO actual_rsvps (name, phone, rsvp_status, items_bringing, extra_items, needed_items, volunteer_roles, merrit_reservoir, message, allergies, note, group_id, year, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())',
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
        TRIP_YEAR,
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
          'INSERT INTO items (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [item]
        )
      }
    }

    // Submit comment if there's a message
    if (message && message.trim() !== '') {
      await query(
        'INSERT INTO comments (comment, commenter_name, date_created) VALUES ($1, $2, NOW())',
        [message.trim(), name]
      )
    }

    revalidatePath('/rsvp') // Revalidate the RSVP page
    revalidatePath('/') // Revalidate the main page if it shows RSVP data
    return {
      success: true,
      message: 'RSVP submitted successfully!',
      groupId: finalGroupId,
    }
  } catch (error) {
    console.error('Error submitting RSVP action:', error)
    return { success: false, error: 'Failed to submit RSVP.' }
  }
}

// New action for getting actual RSVPs
export async function getActualRsvsAction(): Promise<
  ActualRsvpEntry[] | { error: string }
> {
  try {
    // Only the current season's RSVPs are live; past years are served from
    // the historical_roll_call archive instead.
    const result = await query(
      `
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
      WHERE year = $1
      ORDER BY created_at DESC
    `,
      [TRIP_YEAR]
    )

    const rsvps: ActualRsvpEntry[] = result.rows.map((row: any) => {
      let items_bringing_parsed: string[] = []
      if (row.items_bringing) {
        if (typeof row.items_bringing === 'string') {
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
        } else if (typeof row.items_bringing === 'object') {
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
        if (typeof row.volunteer_roles === 'string') {
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
        } else if (typeof row.volunteer_roles === 'object') {
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
        if (typeof row.extra_items === 'string') {
          try {
            extra_items_parsed = JSON.parse(row.extra_items)
          } catch (e) {
            console.error(
              `Failed to parse extra_items for row ID ${row.id}:`,
              row.extra_items,
              e
            )
          }
        } else if (typeof row.extra_items === 'object') {
          extra_items_parsed = row.extra_items
        }
      }

      let needed_items_parsed: string[] = []
      if (row.needed_items) {
        if (typeof row.needed_items === 'string') {
          try {
            needed_items_parsed = JSON.parse(row.needed_items)
          } catch (e) {
            console.error(
              `Failed to parse needed_items for row ID ${row.id}:`,
              row.needed_items,
              e
            )
          }
        } else if (typeof row.needed_items === 'object') {
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
    console.error('Original error fetching actual RSVPs:', error) // Log the full error server-side
    let detailedErrorMessage = 'Failed to fetch RSVPs.'
    if (error && typeof error === 'object' && 'message' in error) {
      detailedErrorMessage += ` Details: ${error.message}`
    } else if (typeof error === 'string') {
      detailedErrorMessage += ` Details: ${error}`
    }
    return { error: detailedErrorMessage }
  }
}

// Claim an item from the "still needed" board: appends it to the claimer's
// existing RSVP (matched by name) so it shows up as something they're bringing.
export async function claimItemAction(
  itemName: string,
  claimerName: string
): Promise<SubmitPollActionResult> {
  try {
    const item = itemName?.trim().slice(0, 60)
    const claimer = claimerName?.trim().slice(0, 80)
    if (!item || !claimer) {
      return { success: false, error: 'Item and name are both required.' }
    }

    // Only people who might actually show up can claim gear.
    const result = await query(
      `SELECT id, name, items_bringing FROM actual_rsvps
       WHERE year = $1 AND LOWER(TRIM(name)) = LOWER($2)
         AND rsvp_status <> 'no'
       ORDER BY created_at ASC`,
      [TRIP_YEAR, claimer]
    )
    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Couldn't find a ${TRIP_YEAR} RSVP under "${claimer}" that's coming. Use the exact name you RSVP'd with - or go RSVP first.`,
      }
    }

    const row = result.rows[0]
    let items: string[] = []
    if (Array.isArray(row.items_bringing)) {
      items = row.items_bringing
    } else if (typeof row.items_bringing === 'string') {
      try {
        items = JSON.parse(row.items_bringing)
      } catch {
        items = []
      }
    }
    if (!items.some((i) => i.toLowerCase() === item.toLowerCase())) {
      items.push(item)
    }

    await query(
      'UPDATE actual_rsvps SET items_bringing = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(items), row.id]
    )
    await query(
      'INSERT INTO items (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [item]
    )

    revalidatePath('/')
    revalidatePath('/rsvp')
    return { success: true, message: `${row.name} is bringing ${item}!` }
  } catch (error) {
    console.error('Error claiming item:', error)
    return { success: false, error: 'Failed to claim item.' }
  }
}

// Claim a volunteer role (predefined or custom): appends it to the claimer's
// existing RSVP, same matching rules as claimItemAction.
export async function claimRoleAction(
  roleName: string,
  claimerName: string
): Promise<SubmitPollActionResult> {
  try {
    const role = roleName?.trim().slice(0, 60)
    const claimer = claimerName?.trim().slice(0, 80)
    if (!role || !claimer) {
      return { success: false, error: 'Role and name are both required.' }
    }

    const result = await query(
      `SELECT id, name, volunteer_roles FROM actual_rsvps
       WHERE year = $1 AND LOWER(TRIM(name)) = LOWER($2)
         AND rsvp_status <> 'no'
       ORDER BY created_at ASC`,
      [TRIP_YEAR, claimer]
    )
    if (result.rows.length === 0) {
      return {
        success: false,
        error: `Couldn't find a ${TRIP_YEAR} RSVP under "${claimer}" that's coming. Use the exact name you RSVP'd with - or go RSVP first.`,
      }
    }

    const row = result.rows[0]
    let roles: string[] = []
    if (Array.isArray(row.volunteer_roles)) {
      roles = row.volunteer_roles
    } else if (typeof row.volunteer_roles === 'string') {
      try {
        roles = JSON.parse(row.volunteer_roles)
      } catch {
        roles = []
      }
    }
    if (!roles.some((r) => r.toLowerCase() === role.toLowerCase())) {
      roles.push(role)
    }

    await query(
      'UPDATE actual_rsvps SET volunteer_roles = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(roles), row.id]
    )

    revalidatePath('/')
    revalidatePath('/rsvp')
    return { success: true, message: `${row.name} is on ${role}!` }
  } catch (error) {
    console.error('Error claiming role:', error)
    return { success: false, error: 'Failed to claim role.' }
  }
}

// All archived years, newest first - used for the weather-context strip.
export async function getHistoricalYearsAction(): Promise<
  HistoricalYearData[] | { error: string }
> {
  try {
    const result = await query(`
      SELECT year, title, daytime_temps, evening_temps, moon_phase,
             sky_visibility, rain, wind, humidity, photo_album_url
      FROM years
      ORDER BY year DESC
    `)
    return result.rows.map((row: any) => ({
      year: row.year,
      title: row.title,
      daytimeTemps: row.daytime_temps,
      eveningTemps: row.evening_temps,
      moonPhase: row.moon_phase,
      skyVisibility: row.sky_visibility,
      rain: row.rain,
      wind: row.wind,
      humidity: row.humidity,
      photoAlbumUrl: row.photo_album_url,
    }))
  } catch (error) {
    console.error('Error fetching historical years:', error)
    return { error: 'Failed to fetch historical years.' }
  }
}

// New action to get predefined items
export async function getPredefinedItemsAction(): Promise<
  string[] | { error: string }
> {
  try {
    // The items table is the single source of truth for bring-list
    // suggestions: every RSVP and gear claim feeds new items into it, and
    // it's curated directly in the DB. No hardcoded defaults, no year
    // filter - the whole accumulated list is fair game.
    const result = await query(`SELECT name FROM items`)
    return (result.rows as { name: string }[])
      .map((row) => row.name)
      .sort((a, b) => a.localeCompare(b))
  } catch (error) {
    console.error('Error fetching predefined items:', error)
    return { error: 'Failed to fetch predefined items.' }
  }
}

// New action to submit comments
export async function submitCommentAction(
  comment: string,
  commenterName?: string
): Promise<SubmitPollActionResult> {
  try {
    if (!comment || comment.trim() === '') {
      return { success: false, error: 'Comment cannot be empty.' }
    }

    await query(
      'INSERT INTO comments (comment, commenter_name, date_created) VALUES ($1, $2, NOW())',
      [comment.trim(), commenterName?.trim() || null]
    )

    return { success: true, message: 'Comment submitted successfully!' }
  } catch (error) {
    console.error('Error submitting comment:', error)
    return { success: false, error: 'Failed to submit comment.' }
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
      'SELECT id, comment, commenter_name, date_created FROM comments ORDER BY date_created DESC'
    )
    return result.rows
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { error: 'Failed to fetch comments.' }
  }
}

// New action to get historical roll call data
export async function getHistoricalRollCallAction(): Promise<
  Array<{ name: string; year: number }> | { error: string }
> {
  try {
    const result = await query(
      'SELECT name, year FROM historical_roll_call ORDER BY year DESC, name ASC'
    )
    return result.rows
  } catch (error) {
    console.error('Error fetching historical roll call:', error)
    return { error: 'Failed to fetch historical roll call.' }
  }
}

// Fetches the collaborative playlist via the Spotify Web API (client-
// credentials flow) so we can render a custom preview. The client secret stays
// server-side (env/Doppler) and never reaches the browser bundle.
export async function getSpotifyPlaylistAction(): Promise<
  SpotifyPlaylist | { error: string }
> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return { error: 'Spotify credentials are not configured.' }
  }
  if (!SPOTIFY_PLAYLIST_URL) {
    return { error: 'No Spotify playlist configured.' }
  }
  const playlistId = SPOTIFY_PLAYLIST_URL.match(
    /open\.spotify\.com\/playlist\/(\w+)/
  )?.[1]
  if (!playlistId) {
    return { error: 'Could not parse the Spotify playlist URL.' }
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    })
    if (!tokenRes.ok) {
      return { error: 'Spotify authentication failed.' }
    }
    const { access_token } = await tokenRes.json()

    const fields =
      'name,description,external_urls,images,tracks.total,tracks.items(track(id,name,external_urls,artists(name),album(images)))'
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=${encodeURIComponent(
        fields
      )}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: 'no-store',
      }
    )
    if (!playlistRes.ok) {
      return { error: `Spotify playlist fetch failed (${playlistRes.status}).` }
    }
    const data = await playlistRes.json()

    const items: any[] = Array.isArray(data.tracks?.items)
      ? data.tracks.items
      : []
    const tracks = items
      .map((item) => item?.track)
      .filter((track) => track && track.id)
      .map((track) => ({
        id: track.id as string,
        name: track.name as string,
        artists: (track.artists || []).map((a: any) => a.name).join(', '),
        albumImage:
          track.album?.images?.[track.album.images.length - 1]?.url ?? null,
        url: (track.external_urls?.spotify ?? SPOTIFY_PLAYLIST_URL) as string,
      }))

    return {
      name: data.name ?? 'Playlist',
      description: data.description ?? '',
      cover: data.images?.[0]?.url ?? null,
      url: data.external_urls?.spotify ?? SPOTIFY_PLAYLIST_URL,
      total: data.tracks?.total ?? tracks.length,
      tracks,
    }
  } catch (error) {
    console.error('Error fetching Spotify playlist:', error)
    return { error: 'Failed to fetch Spotify playlist.' }
  }
}
