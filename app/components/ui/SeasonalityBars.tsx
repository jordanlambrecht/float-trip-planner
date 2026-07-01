import clsx from 'clsx'

// A compact 12-month bar chart showing when a group is most observed, with the
// trip month highlighted. Makes the "these are the species for our dates" claim
// visible: you can see August sitting on the seasonal curve.
interface SeasonalityBarsProps {
  monthly: number[] // 12 values, index 0 = January
  highlightMonth: number // 1-12, drawn in the accent color
  className?: string
}

const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const SeasonalityBars = ({
  monthly,
  highlightMonth,
  className,
}: SeasonalityBarsProps) => {
  const max = Math.max(1, ...monthly)

  return (
    <div className={clsx('flex items-end gap-1 h-16', className)}>
      {monthly.map((value, i) => {
        const isPeak = i + 1 === highlightMonth
        const heightPct = Math.round((value / max) * 100)
        return (
          <div
            key={i}
            className='flex flex-1 flex-col items-center justify-end gap-1 h-full'
            title={`${MONTH_INITIALS[i]}: ${value} observations`}
          >
            <div
              className={clsx(
                'w-full rounded-sm transition-all',
                isPeak ? 'bg-pink-dark' : 'bg-gray'
              )}
              // Floor at 2% so empty months still show a sliver instead of nothing.
              style={{ height: `${Math.max(2, heightPct)}%` }}
            />
            <span
              className={clsx(
                'font-mono text-[10px] leading-none',
                isPeak ? 'font-bold text-pink-dark' : 'text-gray-textlight'
              )}
            >
              {MONTH_INITIALS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default SeasonalityBars
