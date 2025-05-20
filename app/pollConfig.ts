// app/pollConfig.ts

import type { TripOptionDetails, VotePreference } from "@types"

export const tripOptionsStaticDetails: {
  option1: TripOptionDetails
  option2: TripOptionDetails
} = {
  option1: {
    id: "option_1",
    title: "JULY 24th-27th, 2025",
    subTitle: "Primary Option",
    eveningTemps: "Avg 65-70°F",
    moonPhase: "🌚 New Moon (Thu), Waxing Crescent",
    darkSkyQuality: "Excellent (0% illum Thu)",
    meteorActivity: ["Perseids", "Delta Aquarids", "Alpha Capricornids"],
    advantage: "New moon + early meteor activity.",
  },
  option2: {
    id: "option_2",
    title: "AUGUST 21st-24th, 2025",
    subTitle: "Backup Option",
    eveningTemps: "Avg 60-65°F",
    moonPhase: "🌚 New Moon (Sat)",
    darkSkyQuality: "Excellent (Fri-Sun)",
    meteorActivity: ["Perseids (reduced)"],
    advantage: "Perfect dark skies, cooler temps.",
  },
}

export const DESIGN_VOTE_PREFERENCES: {
  value: VotePreference
  label: string
  formCellConfig: {
    base: string
    selected: string
    text: string
    named?: string
  }
  resultCellConfig: { barColor: string; textColor: string }
}[] = [
  {
    value: "works_best",
    label: "WORKS BEST FOR ME!",
    formCellConfig: {
      base: "bg-pink-light hover:bg-pink border-pink-medium",
      selected: "bg-pink-dark text-white ring-2 ring-pink-dark ring-offset-1",
      text: "text-pink-text",
    },
    resultCellConfig: {
      barColor: "bg-pink-dark",
      textColor: "text-pink-text",
    },
  },
  {
    value: "works_not_preferred",
    label: "WORKS BUT NOT PREFERRED",
    formCellConfig: {
      base: "bg-blue-light hover:bg-blue border-blue-medium",
      selected: "bg-blue-dark text-white ring-2 ring-blue-dark ring-offset-1",
      text: "text-blue-text",
    },
    resultCellConfig: {
      barColor: "bg-orange-dark",
      textColor: "text-orange-text",
    },
  },
  {
    value: "idc",
    label: "IDC",
    formCellConfig: {
      base: "bg-purple-light hover:bg-purple border-purple-medium focus:ring-purple-light",
      selected:
        "bg-purple-dark text-white ring-2 ring-purple-dark ring-offset-1",
      text: "text-purple-text",
      named: "purple",
    },
    resultCellConfig: {
      barColor: "bg-purple-dark",
      textColor: "text-purple-text",
    },
  },
  {
    value: "doesnt_work",
    label: "DOESN'T WORK AT ALL",
    formCellConfig: {
      base: "bg-teal-light hover:bg-teal border-teal-medium",
      selected: "bg-teal-dark text-white ring-2 ring-teal-dark ring-offset-1",
      text: "text-teal-text",
    },
    resultCellConfig: {
      barColor: "bg-teal-dark",
      textColor: "text-teal-text",
    },
  },
]
