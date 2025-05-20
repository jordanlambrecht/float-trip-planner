import { DESIGN_VOTE_PREFERENCES } from "@pollConfig"
export type VotePreference =
  | "works_best"
  | "works_not_preferred"
  | "idc"
  | "doesnt_work"

export interface ParticipantVote {
  id: string
  name: string
  option1Vote: VotePreference | null
  option2Vote: VotePreference | null
}

export interface TripOptionDetails {
  id: string
  title: string
  subTitle?: string
  moonPhase: string
  darkSkyQuality: string
  meteorActivity: Array<string>
  eveningTemps: string
  advantage: string
}

export interface PollOptionResult extends TripOptionDetails {
  votes: Record<VotePreference, number>
}

export interface PollResultsData {
  option1: PollOptionResult
  option2: PollOptionResult
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
