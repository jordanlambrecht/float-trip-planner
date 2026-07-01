import { ReactNode } from 'react'
import clsx from 'clsx'

// The standard page section: a full-width, centered, elevated card capped at
// max-w-4xl. Replaces the copy-pasted
//   <section className='w-full ... p-4 sm:p-6'>
//     <div className='p-6 ... max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
// wrapper. Keeping max-w-4xl on the INNER card (not the <section>) is what makes
// every section line up end-to-end - putting it on the <section> lets the
// padding eat ~48px off the width.
interface SectionCardProps {
  children: ReactNode
  // 'card' = standard elevated white card. 'plain' = same structure + shadow,
  // but the caller supplies bg/border (e.g. the yellow cost calculator or the
  // gradient RSVP call-to-action) so there's no bg/border class conflict.
  tone?: 'card' | 'plain'
  className?: string // extra classes on the <section>
  innerClassName?: string // extra classes on the inner card
}

const SectionCard = ({
  children,
  tone = 'card',
  className,
  innerClassName,
}: SectionCardProps) => (
  <section
    className={clsx(
      'w-full flex flex-col items-center justify-center p-4 sm:p-6',
      className
    )}
  >
    <div
      className={clsx(
        'w-full max-w-4xl p-6 rounded-lg shadow-2xl',
        tone === 'card' && 'border border-background-dm bg-cardbg',
        innerClassName
      )}
    >
      {children}
    </div>
  </section>
)

export default SectionCard
