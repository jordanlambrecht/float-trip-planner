'use client'

import { useEffect, useState, useTransition } from 'react'
import Modal from './Modal'

// Shared claim dialog for the gear (InventoryBoard) and roles (RolesBoard)
// boards. Collects a name (+ an optional custom item/role) and delegates the
// write to onSubmit. Copy is passed in so each board reads naturally. Claims
// are additive. More than one person can be down for the same thing.
interface ClaimDialogProps {
  open: boolean
  isCustom: boolean
  title: string
  prompt: string
  customPlaceholder: string
  submitLabel: string
  onClose: () => void
  onSubmit: (
    claimerName: string,
    customValue: string
  ) => Promise<{ success: boolean; error?: string }>
}

const inputClass =
  'w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:outline-none focus:ring-1 focus:ring-pink-dark focus:border-pink-dark mb-3'

const ClaimDialog = ({
  open,
  isCustom,
  title,
  prompt,
  customPlaceholder,
  submitLabel,
  onClose,
  onSubmit,
}: ClaimDialogProps) => {
  const [claimerName, setClaimerName] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Fresh inputs each time the dialog opens.
  useEffect(() => {
    if (open) {
      setClaimerName('')
      setCustomValue('')
      setError(null)
    }
  }, [open])

  const canSubmit =
    claimerName.trim().length > 0 && (!isCustom || customValue.trim().length > 0)

  const submit = () => {
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await onSubmit(claimerName.trim(), customValue.trim())
      if (result.success) onClose()
      else setError(result.error || 'Something went wrong.')
    })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className='text-lg font-bold text-gray-textdark mb-1'>{title}</h3>
      <p className='font-mono text-sm text-gray-textlight mb-4'>{prompt}</p>
      {isCustom && (
        <input
          type='text'
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={customPlaceholder}
          autoFocus
          className={inputClass}
        />
      )}
      <input
        type='text'
        value={claimerName}
        onChange={(e) => setClaimerName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canSubmit) submit()
        }}
        placeholder='Your name'
        autoFocus={!isCustom}
        className={inputClass}
      />
      {error && <p className='font-mono text-xs text-red-text mb-3'>{error}</p>}
      <div className='flex justify-end gap-2'>
        <button
          type='button'
          onClick={onClose}
          disabled={isPending}
          className='px-4 py-2 font-mono text-sm text-gray-textdark border border-gray rounded-md hover:bg-gray-pagebg disabled:opacity-50'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={submit}
          disabled={isPending || !canSubmit}
          className='px-4 py-2 font-mono text-sm text-white bg-pink-dark rounded-md hover:bg-opacity-90 disabled:opacity-50'
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ClaimDialog
