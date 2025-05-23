// app/pollConfig.ts

import type { TripOptionDetails, VotePreference } from "@types"

export const tripOptionsStaticDetails: {
  option1: TripOptionDetails
  option2: TripOptionDetails
} = {
  option1: {
    id: "option_1",
    title: "JULY 24th-27th, 2025",
    subTitle: "Option A",
    daytimeTemps: "Avg 89.2°F",
    eveningTemps: "Avg 61.3°F",
    moonPhase: "🌚 New Moon (Thu)",
    clearSkyChance: "74%",
    rainChance: "32%",
    wind: "Avg 5-10 mph",
    humidity: "14% chance for muggy",
    meteorActivity: ["Perseids", "Delta Aquarids", "Alpha Capricornids"],
    advantages: [
      "New moon AKA totally dark skies",
      "Higher chance of good weather.",
      "Three meteor showers at once.",
      "Perfect nighttime temps.",
    ],
    disadvantages: [
      "Busy season/more people",
      "Hotter daytime temps.",
      "Double chance of muggy.",
    ],
  },
  option2: {
    id: "option_2",
    title: "AUGUST 21st-24th, 2025",
    subTitle: "Option B",
    daytimeTemps: "Avg 86.5°F",
    eveningTemps: "Avg 58.0°F",
    moonPhase: "🌚 New Moon (Sat)",
    clearSkyChance: "76%",
    rainChance: "24%",
    wind: "Avg 5-10 mph",
    humidity: "7% chance for muggy",
    meteorActivity: ["Perseids (reduced)"],
    advantages: [
      "Perfect dark skies, cooler temps.",
      "Less crowded.",
      "Less chance of muggy.",
    ],
    disadvantages: [
      "Risky on if days are too cold",
      "Less meteor activity.",
      "Brighter moon.",
      "Nights are colder.",
    ],
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
