import React from "react"
import type { RsvpEntry } from "@types"

interface MessageWallProps {
  rsvps?: RsvpEntry[]
}

const MessageWall = ({ rsvps = [] }: MessageWallProps) => {
  // Filter out entries without messages
  const messagesWithNames = rsvps.filter(
    (entry) => entry.message && entry.message.trim() !== ""
  )

  // Helper function to format the date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  if (messagesWithNames.length === 0) {
    return (
      <section className='w-full max-w-4xl mx-auto p-4 sm:p-6'>
        <div className='p-6 rounded-lg shadow-2xl border border-background-dm bg-cardbg '>
          <h2 className='text-2xl font-bold mb-4'>Message Board</h2>
          <p className='text-center font-mono text-gray-500 py-8'>
            No messages yet. Add a message when you vote!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm '>
        <h2 className='text-2xl font-bold mb-6'>Message Board</h2>

        <div className='grid grid-cols-1 gap-6'>
          {messagesWithNames.map((entry, index) => (
            <div
              key={`message-${index}`}
              className='bg-background/25 p-5 rounded-lg border border-gray'
            >
              <div className='flex items-center mb-3'>
                <span className='font-mono font-bold text-pink-dark  mr-2'>
                  {entry.name}
                </span>
                <span className='text-xs text-gray-500 italic'>
                  {entry.createdAt
                    ? formatDate(new Date(entry.createdAt))
                    : `${formatDate(new Date())} (${entry.year})`}
                </span>
              </div>
              <p className='font-mono text-gray-700  whitespace-pre-wrap'>
                "{entry.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MessageWall
