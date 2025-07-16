"use client"

import { useState } from "react"
import type { ActualRsvpEntry } from "@types"

interface CostCalculatorProps {
  rsvps?: ActualRsvpEntry[]
}

const CostCalculator = ({ rsvps }: CostCalculatorProps) => {
  const [showPerPerson, setShowPerPerson] = useState(true) // Default to per person

  if (!rsvps) {
    return (
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='w-full bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              💰 Trip Cost Calculator
            </h2>
            <p className='font-mono text-gray-600'>Loading RSVP data...</p>
          </div>
        </div>
      </section>
    )
  }

  // Count people coming
  const attendees = rsvps.filter((rsvp) => rsvp.rsvp_status === "yes")
  const totalPeople = attendees.length
  const merrittAttendees = attendees.filter(
    (rsvp) => rsvp.merrit_reservoir
  ).length

  // Calculate costs
  const campingCostPerPerson = 12
  const campingTax = 0.08
  const campingSubtotal = totalPeople * campingCostPerPerson
  const campingTaxAmount = campingSubtotal * campingTax
  const totalCampingCost = campingSubtotal + campingTaxAmount

  // Tube calculations
  const tubesNeeded = Math.ceil(totalPeople / 2) // Every 2 people need a tube
  const coolerTubesNeeded = Math.ceil(totalPeople / 5) // Every 5 people need a cooler tube
  const tubeRentalCost = tubesNeeded * 85 // $85 per two-person tube
  const coolerTubeRentalCost = coolerTubesNeeded * 12 // $12 per cooler tube
  const totalTubeCost = tubeRentalCost + coolerTubeRentalCost

  // Food estimate
  const foodCostPerPerson = 25
  const totalFoodCost = totalPeople * foodCostPerPerson

  // Merrit park pass
  const merritPassCost = merrittAttendees > 0 ? 10 : 0

  // Grand total
  const grandTotal =
    totalCampingCost + totalTubeCost + totalFoodCost + merritPassCost
  const costPerPerson = totalPeople > 0 ? grandTotal / totalPeople : 0

  return (
    <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='w-full bg-yellow border-2 border-yellow-medium rounded-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            💰 Trip Cost Calculator
          </h2>
          <p className='font-mono text-sm text-gray-600 mb-4'>
            Based on {totalPeople} people attending
          </p>

          {/* Toggle between Total and Per Person */}
          <div className='flex items-center justify-center space-x-2 bg-gray-100 rounded-lg p-1 w-fit mx-auto'>
            <button
              onClick={() => setShowPerPerson(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showPerPerson
                  ? "bg-orange-dark text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Per Person
            </button>
            <button
              onClick={() => setShowPerPerson(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !showPerPerson
                  ? "bg-orange-dark text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Total Cost
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Cost Breakdown */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-gray-800 border-b pb-2'>
              Cost Breakdown
            </h3>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Camping ({totalPeople} × $12):</span>
                <span className='font-mono'>
                  $
                  {showPerPerson
                    ? (campingSubtotal / totalPeople).toFixed(2)
                    : campingSubtotal.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Camping Tax (8%):</span>
                <span className='font-mono'>
                  $
                  {showPerPerson
                    ? (campingTaxAmount / totalPeople).toFixed(2)
                    : campingTaxAmount.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Tube Rentals ({tubesNeeded} × $85):</span>
                <span className='font-mono'>
                  $
                  {showPerPerson
                    ? (tubeRentalCost / totalPeople).toFixed(2)
                    : tubeRentalCost.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Cooler Tubes ({coolerTubesNeeded} × $12):</span>
                <span className='font-mono'>
                  $
                  {showPerPerson
                    ? (coolerTubeRentalCost / totalPeople).toFixed(2)
                    : coolerTubeRentalCost.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Food Estimate ({totalPeople} × $25):</span>
                <span className='font-mono'>
                  $
                  {showPerPerson
                    ? foodCostPerPerson.toFixed(2)
                    : totalFoodCost.toFixed(2)}
                </span>
              </div>
              {merritPassCost > 0 && (
                <div className='flex justify-between'>
                  <span>Merrit Park Pass:</span>
                  <span className='font-mono'>
                    $
                    {showPerPerson
                      ? (merritPassCost / totalPeople).toFixed(2)
                      : merritPassCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-gray-800 border-b pb-2'>
              Summary
            </h3>

            <div className='bg-white rounded-lg p-4 border border-orange-200'>
              <div className='space-y-2'>
                <div className='flex justify-between text-lg font-semibold'>
                  <span>
                    {showPerPerson ? "Cost Per Person:" : "Total Trip Cost:"}
                  </span>
                  <span className='font-mono text-green-700'>
                    $
                    {showPerPerson
                      ? costPerPerson.toFixed(2)
                      : grandTotal.toFixed(2)}
                  </span>
                </div>
                {showPerPerson && (
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Total for {totalPeople} people:</span>
                    <span className='font-mono'>${grandTotal.toFixed(2)}</span>
                  </div>
                )}
                {!showPerPerson && (
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Per Person:</span>
                    <span className='font-mono'>
                      ${costPerPerson.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='text-xs text-gray-500 space-y-1'>
              <p>
                • Tube rentals calculated for {tubesNeeded} two-person tubes
              </p>
              <p>
                • Cooler tubes calculated for {coolerTubesNeeded} cooler tubes
              </p>
              <p>• Food cost is an estimate</p>
              {merrittAttendees > 0 && (
                <p>
                  • Merrit pass needed for {merrittAttendees} attendee
                  {merrittAttendees > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostCalculator
