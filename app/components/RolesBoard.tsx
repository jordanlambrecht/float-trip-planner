'use client'

import { useState, useTransition } from 'react'
import type { ActualRsvpEntry } from '@types'
import { isLikelyComing } from '@types'
import { claimRoleAction } from '@actions'
import { VOLUNTEER_ROLES } from '@pollConfig'

interface RolesBoardProps {
  rsvps?: ActualRsvpEntry[]
  onClaimed?: () => void
  // When embedded (e.g. inside PlanningTabs) skip the outer section/card and
  // heading - the tab chrome provides those.
  embedded?: boolean
}

const RolesBoard = ({
  rsvps = [],
  onClaimed,
  embedded = false,
}: RolesBoardProps) => {
  const [claimingRole, setClaimingRole] = useState<string | null>(null)
  const [isCustomRole, setIsCustomRole] = useState(false)
  const [customRoleName, setCustomRoleName] = useState('')
  const [claimerName, setClaimerName] = useState('')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const attending = rsvps.filter((rsvp) => isLikelyComing(rsvp.rsvp_status))

  // Volunteer roles from config, plus any custom ones living in the data.
  const allRoles = [...VOLUNTEER_ROLES]
  attending.forEach((rsvp) => {
    ;(rsvp.volunteer_roles || []).forEach((role) => {
      if (!allRoles.some((r) => r.toLowerCase() === role.toLowerCase())) {
        allRoles.push(role)
      }
    })
  })

  const claimants = (role: string): string[] =>
    attending
      .filter((rsvp) =>
        (rsvp.volunteer_roles || []).some(
          (r) => r.toLowerCase() === role.toLowerCase()
        )
      )
      .map((rsvp) => rsvp.name.split(/\s+/)[0])

  const openClaimDialog = (role: string | null) => {
    setIsCustomRole(role === null)
    setClaimingRole(role ?? '')
    setCustomRoleName('')
    setClaimerName('')
    setClaimError(null)
  }

  const closeClaimDialog = () => {
    setClaimingRole(null)
    setIsCustomRole(false)
  }

  const submitClaim = () => {
    const role = isCustomRole ? customRoleName.trim() : claimingRole
    if (!role) return
    setClaimError(null)
    startTransition(async () => {
      const result = await claimRoleAction(role, claimerName)
      if (result.success) {
        closeClaimDialog()
        if (onClaimed) onClaimed()
      } else {
        setClaimError(result.error || 'Something went wrong.')
      }
    })
  }

  const canSubmit =
    claimerName.trim().length > 0 &&
    (!isCustomRole || customRoleName.trim().length > 0)

  const body = (
    <>
      <p className='font-mono text-sm text-gray-textlight mb-6 max-w-xl'>
        Volunteer roles, filled and unfilled.
      </p>

      <div className='flex flex-wrap gap-2'>
        {allRoles.map((role) => {
          const names = claimants(role)
          const filled = names.length > 0
          return filled ? (
            <span
              key={role}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-full bg-teal-light text-teal-text border border-teal-medium'
            >
              {role}
              <span className='text-teal-dark font-bold'>
                — {names.join(', ')}
              </span>
            </span>
          ) : (
            <button
              key={role}
              type='button'
              onClick={() => openClaimDialog(role)}
              className='inline-flex items-center px-3 py-1.5 font-mono text-xs rounded-full text-gray-textlight border border-dashed border-gray-textlight/60 hover:text-gray-textdark hover:border-gray-textdark hover:scale-105 transition-all cursor-pointer'
            >
              {role}
              <span className='ml-1.5 italic'>— open</span>
            </button>
          )
        })}
        <button
          type='button'
          onClick={() => openClaimDialog(null)}
          className='px-3 py-1.5 font-mono text-xs rounded-full text-gray-textlight border border-dashed border-gray-textlight/60 hover:text-gray-textdark hover:border-gray-textdark transition-colors cursor-pointer'
        >
          ➕ custom role
        </button>
      </div>
    </>
  )

  const dialog = claimingRole !== null && (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='w-full max-w-sm p-6 rounded-lg shadow-xl bg-cardbg border border-gray-300'>
        <h3 className='text-lg font-bold text-gray-textdark mb-1'>
          {isCustomRole
            ? 'Inventing a role?'
            : `You're claiming: ${claimingRole}`}
        </h3>
        <p className='font-mono text-sm text-gray-textlight mb-4'>
          {isCustomRole ? "What's the role, and who" : 'Who'} are you? Use the
          same name you RSVP&apos;d with.
        </p>
        {isCustomRole && (
          <input
            type='text'
            value={customRoleName}
            onChange={(e) => setCustomRoleName(e.target.value)}
            placeholder='The role'
            autoFocus
            className='w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:outline-none focus:ring-1 focus:ring-pink-dark focus:border-pink-dark mb-3'
          />
        )}
        <input
          type='text'
          value={claimerName}
          onChange={(e) => setClaimerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) submitClaim()
          }}
          placeholder='Your name'
          autoFocus={!isCustomRole}
          className='w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:outline-none focus:ring-1 focus:ring-pink-dark focus:border-pink-dark mb-3'
        />
        {claimError && (
          <p className='font-mono text-xs text-red-600 mb-3'>{claimError}</p>
        )}
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={closeClaimDialog}
            disabled={isPending}
            className='px-4 py-2 font-mono text-sm text-gray-textdark border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={submitClaim}
            disabled={isPending || !canSubmit}
            className='px-4 py-2 font-mono text-sm text-white bg-pink-dark rounded-md hover:bg-opacity-90 disabled:opacity-50'
          >
            {isPending ? 'Claiming...' : "That's Me"}
          </button>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <>
        {body}
        {dialog}
      </>
    )
  }

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <h2>Camp Counselors</h2>
        {body}
      </div>
      {dialog}
    </section>
  )
}

export default RolesBoard
