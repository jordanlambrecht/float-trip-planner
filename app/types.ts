import { DESIGN_VOTE_PREFERENCES } from "@pollConfig"
export type VotePreference =
  | "works_best"
  | "works_not_preferred"
  | "idc"
  | "doesnt_work"

export type RSVPStatus = "yes" | "no"

export interface ParticipantVote {
  id: string
  name: string
  option1Vote: VotePreference | null
  option2Vote: VotePreference | null
  rsvp: RSVPStatus | null
  message?: string | null
}

export interface TripOptionDetails {
  id: string
  title: string
  subTitle?: string
  moonPhase: string
  clearSkyChance: string
  meteorActivity: Array<string>
  eveningTemps: string
  daytimeTemps: string
  rainChance: string
  wind: string
  humidity: string
  advantages: Array<string>
  disadvantages: Array<string>
}

export interface PollOptionResult extends TripOptionDetails {
  votes: Record<VotePreference, number>
}

export interface RsvpEntry {
  name: string
  rsvp: RSVPStatus | null
  year: number
  message?: string | null
  createdAt?: string // ISO date string
}

export interface PollResultsData {
  option1: PollOptionResult
  option2: PollOptionResult
  rsvps?: RsvpEntry[]
}
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  iconSrc?: string
}

export interface PollFormProps {
  tripOptions: { option1: TripOptionDetails; option2: TripOptionDetails }
  votePreferences: typeof DESIGN_VOTE_PREFERENCES
  onFormSubmitSuccess: (submittedNames: string[]) => void
}

export interface DetailRowProps {
  label: string
  value1: string | Array<string>
  value2: string | Array<string>
}

export interface PollViewSwitcherProps {
  view: "form" | "results"
  pollResults: PollResultsData | null
  tripOptions: { option1: TripOptionDetails; option2: TripOptionDetails }
  onFormSubmitSuccess: () => void
  onResetToForm: () => void
  error: string | null
}
export interface PollResultsProps {
  results: PollResultsData
  votePreferences: typeof DESIGN_VOTE_PREFERENCES
  onResetToForm: () => void
}

export interface HistoricalYearData {
  year: number
  title: string
  daytimeTemps?: string
  eveningTemps?: string
  moonPhase?: string
  skyVisibility?: string
  rain?: string
  wind?: string
  humidity?: string
  meteorActivity?: string[]
  notes?: string
  photoAlbumUrl?: string
}

// New interfaces for actual RSVP system
export interface ActualRsvpEntry {
  id?: number
  name: string
  rsvp_status: RSVPStatus
  phone?: string
  items_bringing?: string[]
  extra_items?: string[]
  needed_items?: string[]
  message?: string
  note?: string
  merrit_reservoir?: boolean
  volunteer_roles?: string[]
  allergies?: string[]
  group_id?: string
  year: number
  created_at?: string
  updated_at?: string
}

export interface ActualRsvpFormData {
  name: string
  rsvp_status: RSVPStatus | null
  phone?: string
  items_bringing?: string[]
  message?: string
  merrit_reservoir?: boolean
  volunteer_roles?: string[]
  extra_items?: string[]
  needed_items?: string[]
  allergies?: string[]
  note?: string
}

export interface ActualRsvpParticipant {
  id: string
  name: string
  rsvp_status: RSVPStatus | null
  phone?: string
  items_bringing?: string[]
  message?: string
  merrit_reservoir?: boolean
  volunteer_roles?: string[]
}

export interface ActualRsvpFormProps {
  onFormSubmitSuccess: () => void
  rsvps?: ActualRsvpEntry[]
}

export interface Comment {
  id: number
  comment: string
  commenter_name: string
  date_created: string
}
