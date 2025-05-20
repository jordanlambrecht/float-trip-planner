// app/components/PollForm.tsx
"use client"

import { FormEvent, useState, useTransition } from "react"
import cn from "clsx"
import type { PollFormProps, VotePreference, ParticipantVote } from "@types"
import { ConfirmationModal } from "@components"
import { submitPollAction } from "@actions"

const PollForm = ({ votePreferences, onFormSubmitSuccess }: PollFormProps) => {
  const getInitialParticipant = () => ({
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    name: "",
    option1Vote: null,
    option2Vote: null,
  })

  const [participants, setParticipants] = useState<ParticipantVote[]>([
    getInitialParticipant(),
  ])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)

  const addParticipant = () => {
    setParticipants([...participants, getInitialParticipant()])
    setSuccessMessage(null)
    setError(null)
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  const updateParticipantName = (id: string, name: string) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  const updateParticipantVote = (
    id: string,
    optionKey: "option1Vote" | "option2Vote",
    vote: VotePreference
  ) => {
    setParticipants(
      participants.map((p) =>
        p.id === id
          ? { ...p, [optionKey]: p[optionKey] === vote ? null : vote }
          : p
      )
    )
  }

  const requestClearAllParticipants = () => {
    setIsClearAllModalOpen(true)
  }

  const performClearAllParticipants = () => {
    setParticipants([getInitialParticipant()])
    setError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const validParticipants = participants.filter((p) => p.name.trim() !== "")
    if (validParticipants.length === 0) {
      setError("Please add at least one participant with a name.")
      return
    }

    for (const p of validParticipants) {
      if (!p.option1Vote || !p.option2Vote) {
        setError(
          `Please make a selection for both trip options for ${
            p.name || `Voter ${participants.indexOf(p) + 1}`
          }.`
        )
        return
      }
    }

    startTransition(async () => {
      const submissions = validParticipants.map(
        ({ name, option1Vote, option2Vote }) => ({
          name,
          option1Vote,
          option2Vote,
        })
      )
      // @ts-ignore // TODO: Fix type for submissions if Omit<ParticipantVote, "id"> is not directly assignable
      const result = await submitPollAction(submissions)

      if (result.success) {
        const submittedNames = validParticipants.map((p) => p.name)
        setSuccessMessage(
          result.message ||
            "Thanks you kindly. Your preferences have been submitted."
        )
        onFormSubmitSuccess(submittedNames) // This will trigger fetchPollData in page.tsx
      } else {
        setError(result.error || "An unexpected error occurred.")
      }
    })
  }

  const renderVoteCell = (
    participantId: string,
    optionKey: "option1Vote" | "option2Vote",
    currentVote: VotePreference | null,
    voteOption: (typeof votePreferences)[0]
  ) => {
    const isSelected = currentVote === voteOption.value
    const config = voteOption.formCellConfig
    const baseClasses =
      "w-full p-3 font-mono text-xs sm:text-sm uppercase tracking-wider border rounded-md text-center transition-all duration-150 ease-in-out"
    const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-1"

    let testClassName
    if (voteOption.value === "works_best" && !isSelected) {
      testClassName = `${baseClasses} ${focusClasses} bg-pink-light hover:bg-pink border-pink-medium text-pink-dark`
    } else {
      testClassName = cn(baseClasses, focusClasses, {
        [config.selected]: isSelected,
        [config.base]: !isSelected,
        [config.text]: !isSelected,
      })
    }

    return (
      <button
        key={voteOption.value}
        type='button'
        onClick={() =>
          updateParticipantVote(participantId, optionKey, voteOption.value)
        }
        className={testClassName}
        title={voteOption.label}
      >
        {voteOption.label}
      </button>
    )
  }

  return (
    <>
      <div className='space-y-6 sm:space-y-8'>
        {successMessage && (
          <div className='p-3 mb-4 text-sm text-center text-green-700 bg-green-100 border border-green-200 rounded-md'>
            {successMessage}
          </div>
        )}
        {error && (
          <div className='p-3 mb-4 text-sm text-center text-red-700 bg-red-300 border border-red-400 rounded-md'>
            {error}
          </div>
        )}

        {participants.length > 0 && (
          <div className='mb-2 text-right'>
            <button
              type='button'
              onClick={requestClearAllParticipants}
              className='font-mono text-xs text-gray-textlight hover:text-pink-dark hover:underline focus:outline-none'
            >
              Clear All Voters & Selections
            </button>
          </div>
        )}

        {participants.map((p, index) => (
          <div
            key={p.id}
            className='p-4 space-y-4 border rounded-lg shadow-sm bg-background/50 dark:bg-background-dm/50 border-gray'
          >
            <div className='flex items-center'>
              <input
                type='text'
                value={p.name}
                onChange={(e) => updateParticipantName(p.id, e.target.value)}
                placeholder={`Voter ${index + 1} Name`}
                className='focus:outline-none grow p-2.5 font-mono text-sm border border-text-dm dark:bg-background/25 rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark '
                required
              />
              {participants.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeParticipant(p.id)}
                  className='ml-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors'
                  aria-label='Remove participant'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-5 h-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className='grid grid-cols-2 gap-3 sm:gap-4'>
              <div className='space-y-2 sm:space-y-3'>
                {votePreferences.map((pref) =>
                  renderVoteCell(p.id, "option1Vote", p.option1Vote, pref)
                )}
              </div>
              <div className='space-y-2 sm:space-y-3'>
                {votePreferences.map((pref) =>
                  renderVoteCell(p.id, "option2Vote", p.option2Vote, pref)
                )}
              </div>
            </div>
          </div>
        ))}

        <div className='flex flex-col gap-3 pt-4 sm:flex-row'>
          <button
            type='button'
            onClick={addParticipant}
            className='flex-1 font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-4 border border-gray text-gray-textdark bg-gray-cardbg hover:bg-gray-pagebg hover:border-gray-textlight rounded-md transition-colors'
          >
            + Add Another Voter
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isPending || participants.length === 0}
            className='flex-1 font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-6 bg-pink-dark text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2 disabled:opacity-60'
          >
            {isPending ? "Submitting..." : "Submit All Votes"}{" "}
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={performClearAllParticipants}
        iconSrc={"/deadPixel.png"}
        title='Clear All Voters?'
        message='Are you sure you want to clear all voter entries? This will remove all names and selections from the current form.'
        confirmText='Clear All'
      />
    </>
  )
}

export default PollForm
