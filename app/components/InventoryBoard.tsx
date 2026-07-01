'use client'

import { useState, useEffect } from 'react'
import type { ActualRsvpEntry } from '@types'
import { isLikelyComing } from '@types'
import { claimItemAction, getPredefinedItemsAction } from '@actions'
import SectionCard from './ui/SectionCard'
import Pill from './ui/Pill'
import ClaimDialog from './ui/ClaimDialog'
import { H2, Muted } from './ui/Typography'

interface InventoryBoardProps {
  rsvps?: ActualRsvpEntry[]
  onClaimed?: () => void
  // When embedded (e.g. inside PlanningTabs) skip the outer card and heading -
  // the tab chrome provides those.
  embedded?: boolean
}

const InventoryBoard = ({
  rsvps = [],
  onClaimed,
  embedded = false,
}: InventoryBoardProps) => {
  // The live items table - the same list the RSVP form suggests from.
  const [dbItems, setDbItems] = useState<string[]>([])
  // null = dialog closed. '' + isCustom = custom item entry.
  const [claimingItem, setClaimingItem] = useState<string | null>(null)
  const [isCustomItem, setIsCustomItem] = useState(false)

  useEffect(() => {
    getPredefinedItemsAction().then((result) => {
      if (Array.isArray(result)) setDbItems(result)
    })
  }, [])

  const attending = rsvps.filter((rsvp) => isLikelyComing(rsvp.rsvp_status))

  // Every communal item: the live items table plus anything anyone is already
  // bringing, deduped by name, each carrying its claimants. Claims are additive
  // (non-exclusive) - tapping a covered item just adds you alongside.
  const itemMap = new Map<string, { label: string; names: string[] }>()
  dbItems.forEach((item) => {
    const key = item.toLowerCase()
    if (!itemMap.has(key)) itemMap.set(key, { label: item, names: [] })
  })
  attending.forEach((rsvp) => {
    const firstName = rsvp.name.split(/\s+/)[0]
    ;(rsvp.items_bringing || []).forEach((item) => {
      const key = item.toLowerCase()
      if (!itemMap.has(key)) itemMap.set(key, { label: item, names: [] })
      itemMap.get(key)!.names.push(firstName)
    })
  })
  const items = Array.from(itemMap.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => {
      // "Still needs a hand" first, then covered; alphabetical within each.
      const aCovered = a.names.length > 0
      const bCovered = b.names.length > 0
      if (aCovered !== bCovered) return aCovered ? 1 : -1
      return a.label.localeCompare(b.label)
    })

  const openClaimDialog = (item: string | null) => {
    setIsCustomItem(item === null)
    setClaimingItem(item ?? '')
  }
  const closeClaimDialog = () => setClaimingItem(null)

  const handleSubmit = async (claimerName: string, customValue: string) => {
    const item = isCustomItem ? customValue : (claimingItem ?? '')
    const result = await claimItemAction(item, claimerName)
    if (result.success && onClaimed) onClaimed()
    return result
  }

  const body = (
    <>
      <Muted className='mb-6 max-w-xl'>
        Communal gear for camp. Tap anything to say you can bring it - more than
        one person can pitch in on the same thing, and we&apos;ll sort out the
        final details later.
      </Muted>

      <div className='flex flex-wrap gap-2'>
        {items.map(({ key, label, names }) => {
          const covered = names.length > 0
          return (
            <Pill
              key={key}
              variant={covered ? 'teal' : 'pink'}
              onClick={() => openClaimDialog(label)}
            >
              {label}
              {covered && (
                <span className='text-teal-dark font-bold'>
                  — {names.join(', ')}
                </span>
              )}
            </Pill>
          )
        })}
        <Pill variant='dashed' onClick={() => openClaimDialog(null)}>
          ➕ something else
        </Pill>
      </div>
    </>
  )

  const dialog = (
    <ClaimDialog
      open={claimingItem !== null}
      isCustom={isCustomItem}
      title={
        isCustomItem
          ? 'Bringing something else?'
          : `Can you bring: ${claimingItem}?`
      }
      prompt={
        isCustomItem
          ? "What is it, and who are you? Use the same name you RSVP'd with."
          : "Who are you? Use the same name you RSVP'd with."
      }
      customPlaceholder='The item'
      submitLabel='I can bring it'
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
      <H2>Gear</H2>
      {body}
      {dialog}
    </SectionCard>
  )
}

export default InventoryBoard
