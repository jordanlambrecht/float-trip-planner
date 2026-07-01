'use client'

import { useState } from 'react'
import type { ActualRsvpEntry } from '@types'
import { isLikelyComing } from '@types'
import { claimRoleAction } from '@actions'
import { VOLUNTEER_ROLES } from '@pollConfig'
import SectionCard from './ui/SectionCard'
import Pill from './ui/Pill'
import ClaimDialog from './ui/ClaimDialog'
import { H2, Muted } from './ui/Typography'

interface RolesBoardProps {
  rsvps?: ActualRsvpEntry[]
  onClaimed?: () => void
  // When embedded (e.g. inside PlanningTabs) skip the outer card and heading -
  // the tab chrome provides those.
  embedded?: boolean
}

const RolesBoard = ({
  rsvps = [],
  onClaimed,
  embedded = false,
}: RolesBoardProps) => {
  // null = dialog closed. '' + isCustom = custom role entry.
  const [claimingRole, setClaimingRole] = useState<string | null>(null)
  const [isCustomRole, setIsCustomRole] = useState(false)

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
  }
  const closeClaimDialog = () => setClaimingRole(null)

  const handleSubmit = async (claimerName: string, customValue: string) => {
    const role = isCustomRole ? customValue : (claimingRole ?? '')
    const result = await claimRoleAction(role, claimerName)
    if (result.success && onClaimed) onClaimed()
    return result
  }

  const body = (
    <>
      <Muted className='mb-6 max-w-xl'>
        Who&apos;s down for what. Tap any role to add yourself. More than one
        person can be down for the same thing and we&apos;ll sort out the
        details later.
      </Muted>

      <div className='flex flex-wrap gap-2'>
        {allRoles.map((role) => {
          const names = claimants(role)
          const filled = names.length > 0
          return (
            <Pill
              key={role}
              variant={filled ? 'teal' : 'dashed'}
              onClick={() => openClaimDialog(role)}
            >
              {role}
              {filled ? (
                <span className='text-teal-dark font-bold'>
                  — {names.join(', ')}
                </span>
              ) : (
                <span className='ml-1.5 italic'>— open</span>
              )}
            </Pill>
          )
        })}
        <Pill variant='dashed' onClick={() => openClaimDialog(null)}>
          ➕ custom role
        </Pill>
      </div>
    </>
  )

  const dialog = (
    <ClaimDialog
      open={claimingRole !== null}
      isCustom={isCustomRole}
      title={isCustomRole ? 'Adding a role' : `Down for: ${claimingRole}`}
      prompt={
        isCustomRole
          ? "What's the role, and who are you? Use the same name you RSVP'd with."
          : "Who are you? Use the same name you RSVP'd with."
      }
      customPlaceholder='The role'
      submitLabel="I'm down"
      onClose={closeClaimDialog}
      onSubmit={handleSubmit}
    />
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
    <SectionCard>
      <H2>Camp Counselors</H2>
      {body}
      {dialog}
    </SectionCard>
  )
}

export default RolesBoard
