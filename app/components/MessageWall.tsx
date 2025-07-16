"use client"

import React, { useState, useEffect, useTransition } from "react"
import type { Comment } from "@types"
import { getCommentsAction, submitCommentAction } from "@actions"

interface MessageWallProps {
  // Remove rsvps prop since we're fetching comments directly
}

const MessageWall = ({}: MessageWallProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [commenterName, setCommenterName] = useState("")
  const [isSubmitting, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const result = await getCommentsAction()
        if (Array.isArray(result)) {
          setComments(result)
        } else {
          console.error("Error fetching comments:", result.error)
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [])

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitError(null)
    setSubmitSuccess(false)

    startTransition(async () => {
      try {
        const result = await submitCommentAction(
          newComment.trim(),
          commenterName.trim()
        )
        if (result.success) {
          setNewComment("")
          setCommenterName("")
          setSubmitSuccess(true)
          // Refresh comments
          const updatedComments = await getCommentsAction()
          if (Array.isArray(updatedComments)) {
            setComments(updatedComments)
          }
          // Clear success message after 3 seconds
          setTimeout(() => setSubmitSuccess(false), 3000)
        } else {
          setSubmitError(result.error || "Failed to submit comment")
        }
      } catch (error) {
        setSubmitError("An unexpected error occurred")
        console.error("Comment submission error:", error)
      }
    })
  }

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm '>
          <h2 className='text-2xl font-bold mb-4'>Message Board</h2>
          <p className='text-center font-mono text-gray-500 py-8'>
            Loading messages...
          </p>
        </div>
      </section>
    )
  }

  if (comments.length === 0) {
    return (
      <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm '>
          <h2 className='text-2xl font-bold mb-4'>Message Board</h2>

          {/* Comment submission form */}
          <div className='border-2 border-pink-dark rounded-lg p-4 mb-6'>
            <form onSubmit={handleSubmitComment}>
              <div className='space-y-3'>
                <input
                  type='text'
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  placeholder='Your name'
                  className='w-full p-3 font-mono text-sm border border-text-dm rounded-md focus:outline-none focus:ring-none '
                  disabled={isSubmitting}
                />
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Add a message to the board...'
                  className='w-full p-3 font-mono text-sm border border-text-dm rounded-md focus:outline-none focus:ring-none resize-none'
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className='flex items-center justify-between'>
                  <div className='text-xs text-gray-500'>
                    {submitSuccess && (
                      <span className='text-green-600 font-medium'>
                        Comment added successfully!
                      </span>
                    )}
                    {submitError && (
                      <span className='text-red-600 font-medium'>
                        {submitError}
                      </span>
                    )}
                  </div>
                  <button
                    type='submit'
                    disabled={!newComment.trim() || isSubmitting}
                    className='px-4 py-2 font-mono text-sm bg-pink-dark text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <p className='text-center font-mono text-gray-500 py-8'>
            No messages yet. Be the first to add one!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm '>
        <h2 className='text-2xl font-bold mb-6'>Message Board</h2>

        {/* Comment submission form */}
        <div className='border-2 border-pink-dark rounded-lg p-4 mb-6'>
          <form onSubmit={handleSubmitComment}>
            <div className='space-y-3'>
              <input
                type='text'
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder='Your name'
                className='w-full p-3 font-mono text-sm border border-text-dm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400'
                disabled={isSubmitting}
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Add a message to the board...'
                className='w-full p-3 font-mono text-sm border border-text-dm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none'
                rows={3}
                disabled={isSubmitting}
              />
              <div className='flex items-center justify-between'>
                <div className='text-xs text-gray-500'>
                  {submitSuccess && (
                    <span className='text-green-600 font-medium'>
                      Comment added successfully!
                    </span>
                  )}
                  {submitError && (
                    <span className='text-red-600 font-medium'>
                      {submitError}
                    </span>
                  )}
                </div>
                <button
                  type='submit'
                  disabled={!newComment.trim() || isSubmitting}
                  className='px-4 py-2 font-mono text-sm bg-pink-dark text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className='grid grid-cols-1 gap-3'>
          {comments.map((comment, index) => (
            <div
              key={`comment-${comment.id}`}
              className='bg-background/25 px-5 rounded-lg border border-gray'
            >
              <div className='flex items-center mb-1'>
                <span className='font-mono font-bold text-pink-dark  mr-2'>
                  {comment.commenter_name
                    ? comment.commenter_name
                    : "Anonymous"}
                </span>
                <span className='text-xs text-gray-500 italic'>
                  {formatDate(comment.date_created)}
                </span>
              </div>
              <p className='font-mono text-gray-700  whitespace-pre-wrap'>
                "{comment.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MessageWall
