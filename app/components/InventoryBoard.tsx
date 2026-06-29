'use client'

import { useState, useEffect, useTransition, DragEvent } from 'react'
import type { ActualRsvpEntry } from '@types'
import { isLikelyComing } from '@types'
import { claimItemAction, getPredefinedItemsAction } from '@actions'

interface InventoryBoardProps {
  rsvps?: ActualRsvpEntry[]
  onClaimed?: () => void
  // When embedded (e.g. inside PlanningTabs) skip the outer section/card and
  // heading - the tab chrome provides those.
  embedded?: boolean
}

const InventoryBoard = ({
  rsvps = [],
  onClaimed,
  embedded = false,
}: InventoryBoardProps) => {
  // The live items table - the same list the RSVP form suggests from.
  const [dbItems, setDbItems] = useState<string[]>([])
  const [claimingItem, setClaimingItem] = useState<string | null>(null)
  const [isCustomItem, setIsCustomItem] = useState(false)
  const [customItemName, setCustomItemName] = useState('')
  const [claimerName, setClaimerName] = useState('')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    getPredefinedItemsAction().then((result) => {
      if (Array.isArray(result)) setDbItems(result)
    })
  }, [])

  const attending = rsvps.filter((rsvp) => isLikelyComing(rsvp.rsvp_status))

  // item (lowercase) -> { display name, who's bringing it }. Spare gear
  // someone offered ("has extra") counts as covered too.
  const bringingMap = new Map<string, { label: string; names: string[] }>()
  attending.forEach((rsvp) => {
    ;(rsvp.items_bringing || []).forEach((item) => {
      const key = item.toLowerCase()
      if (!bringingMap.has(key)) {
        bringingMap.set(key, { label: item, names: [] })
      }
      bringingMap.get(key)!.names.push(rsvp.name.split(/\s+/)[0])
    })
    ;(rsvp.extra_items || []).forEach((item) => {
      const key = item.toLowerCase()
      if (!bringingMap.has(key)) {
        bringingMap.set(key, { label: item, names: [] })
      }
      bringingMap.get(key)!.names.push(`${rsvp.name.split(/\s+/)[0]} (extra)`)
    })
  })

  // Still needed = explicit asks from RSVPs + the live items table, minus
  // anything someone already claimed.
  const neededCandidates = [
    ...attending.flatMap((rsvp) => rsvp.needed_items || []),
    ...dbItems,
  ]
  const stillNeed: string[] = []
  const seen = new Set<string>()
  neededCandidates.forEach((item) => {
    const key = item.toLowerCase()
    if (!seen.has(key) && !bringingMap.has(key)) {
      seen.add(key)
      stillNeed.push(item)
    }
  })
  stillNeed.sort((a, b) => a.localeCompare(b))

  const bringing = Array.from(bringingMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  )

  const openClaimDialog = (item: string | null) => {
    setIsCustomItem(item === null)
    setClaimingItem(item ?? '')
    setCustomItemName('')
    setClaimerName('')
    setClaimError(null)
  }

  const closeClaimDialog = () => {
    setClaimingItem(null)
    setIsCustomItem(false)
  }

  const submitClaim = () => {
    const item = isCustomItem ? customItemName.trim() : claimingItem
    if (!item) return
    setClaimError(null)
    startTransition(async () => {
      const result = await claimItemAction(item, claimerName)
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
    (!isCustomItem || customItemName.trim().length > 0)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const item = e.dataTransfer.getData('text/plain')
    if (item) openClaimDialog(item)
  }

  const body = (
    <>
      <p className='font-mono text-sm text-gray-textlight mb-6 max-w-xl'>
        What still needs a home and what&apos;s covered. Click (or drag over)
        anything in &quot;Still Need&quot; to claim it.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Still Need column */}
        <div className='rounded-lg border-2 border-pink-medium/60 p-4'>
          <h3 className='mb-3 text-pink-dark'>
            🙏 Still Need ({stillNeed.length})
          </h3>
          <div className='flex flex-wrap gap-2'>
            {stillNeed.map((item) => (
              <button
                key={item}
                type='button'
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                onClick={() => openClaimDialog(item)}
                className='px-3 py-1.5 font-mono text-xs rounded-full bg-pink-light text-pink-text border border-pink-medium hover:bg-pink hover:scale-105 transition-all cursor-pointer'
              >
                {item}
              </button>
            ))}
            <button
              type='button'
              onClick={() => openClaimDialog(null)}
              className='px-3 py-1.5 font-mono text-xs rounded-full text-gray-textlight border border-dashed border-gray-textlight/60 hover:text-gray-textdark hover:border-gray-textdark transition-colors cursor-pointer'
            >
              ➕ something else
            </button>
          </div>
        </div>

        {/* Bringing column */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-lg border-2 p-4 transition-colors ${
            isDragOver
              ? 'border-teal-dark bg-teal-light/40'
              : 'border-teal-medium/60'
          }`}
        >
          <h3 className='mb-3 text-teal-dark'>
            ✅ Bringing ({bringing.length})
          </h3>
          {bringing.length === 0 ? (
            <p className='font-mono text-sm text-gray-textlight'>
              Nothing claimed yet. Be the hero.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {bringing.map(({ label, names }) => (
                <span
                  key={label}
                  title={`Brought by ${names.join(', ')}`}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-full bg-teal-light text-teal-text border border-teal-medium'
                >
                  {label}
                  <span className='text-teal-dark font-bold'>
                    — {names.join(', ')}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  const dialog = claimingItem !== null && (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='w-full max-w-sm p-6 rounded-lg shadow-xl bg-cardbg border border-gray-300'>
        <h3 className='text-lg font-bold text-gray-textdark mb-1'>
          {isCustomItem
            ? "You're bringing something else?"
            : `You're bringing: ${claimingItem}`}
        </h3>
        <p className='font-mono text-sm text-gray-textlight mb-4'>
          {isCustomItem ? 'What is it, and who' : 'Who'} are you? Use the same
          name you RSVP&apos;d with.
        </p>
        {isCustomItem && (
          <input
            type='text'
            value={customItemName}
            onChange={(e) => setCustomItemName(e.target.value)}
            placeholder='The item'
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
          autoFocus={!isCustomItem}
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
            {isPending ? 'Claiming...' : 'I Got It'}
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
        <h2>Gear</h2>
        {body}
      </div>
      {dialog}
    </section>
  )
}

export default InventoryBoard
