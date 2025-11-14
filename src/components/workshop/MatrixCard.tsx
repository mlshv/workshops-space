import { Popover } from '@base-ui-components/react/popover'
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react'
import { toFixed } from '@/lib/to-fixed'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion } from 'motion/react'
import type { Vote, User } from '@/types/workshop'
import type { AggregatedScore } from '@/lib/aggregateVotes'
import { CardDetailsModal } from './CardDetailsModal'

type MatrixCardProps = {
  text: string
  className?: string
  score: {
    importance: number
    complexity: number
  } | null
  isDragging?: boolean
  dragOverlay?: boolean
  resultsMode?: boolean
  anonymousVotes?: boolean
  voteData?: {
    votes: Vote[]
    users: User[]
    aggregated: AggregatedScore
  }
  zIndex?: number
  authorColor?: string
}

export function MatrixCard({
  text,
  className,
  score,
  isDragging,
  resultsMode = false,
  anonymousVotes = false,
  voteData,
  dragOverlay = false,
  zIndex,
  authorColor = 'var(--color-sticky-note-yellow)',
}: MatrixCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Popover.Root open={score !== null && isDragging}>
        <Popover.Trigger
          nativeButton={false}
          render={(props) => (
            // @ts-expect-error - it's fine
            <motion.div
              {...props}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
              onClick={resultsMode ? () => setDialogOpen(true) : undefined}
              className={cn(
                'MatrixCard relative px-3 py-2 bg-white rounded text-xs w-[12vw] h-[8vw] leading-tight',
                'overflow-hidden select-none transition-scale duration-200 border-2 border-background',
                className,
              )}
              style={{ backgroundColor: authorColor }}
            >
              {text}
              <div
                className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${authorColor}, transparent)`,
                }}
              />
              <button
                className="absolute bottom-1 right-1 cursor-pointer hover:scale-110 transition-transform duration-100 active:scale-95"
                onPointerDown={(e) => {
                  e.stopPropagation()
                }}
                onClick={() => {
                  setDialogOpen(true)
                }}
              >
                <ArrowsOutSimpleIcon />
              </button>
            </motion.div>
          )}
        />
        {score && isDragging && (
          <Popover.Portal>
            <Popover.Positioner
              sideOffset={4}
              side="bottom"
              align="start"
              style={{ zIndex }}
            >
              <Popover.Popup className="text-xxs px-3 py-2 bg-gray-800 text-white rounded shadow-lg z-50">
                <span>Importance:</span>{' '}
                <span className="font-medium">
                  {toFixed(score.importance, 1)}/10
                </span>
                <br />
                <span>Complexity:</span>{' '}
                <span className="font-medium">
                  {toFixed(score.complexity, 1)}/10
                </span>
                <Popover.Arrow className="fill-gray-800" />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </Popover.Root>

      <CardDetailsModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        text={text}
        authorColor={authorColor}
        anonymousVotes={anonymousVotes}
        voteData={voteData}
      />
    </>
  )
}
