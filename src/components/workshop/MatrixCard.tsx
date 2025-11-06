import { Popover } from '@base-ui-components/react/popover'
import { Dialog } from '@base-ui-components/react/dialog'
import { ArrowsOutSimpleIcon, XIcon } from '@phosphor-icons/react'
import { toFixed } from '@/lib/to-fixed'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Vote, User } from '@/types/workshop'
import type { AggregatedScore } from '@/lib/aggregateVotes'
import { UserAvatar } from './UserAvatar'

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
  voteData?: {
    votes: Vote[]
    users: User[]
    aggregated: AggregatedScore
  }
  zIndex?: number
}

export function MatrixCard({
  text,
  className,
  score,
  isDragging,
  resultsMode = false,
  voteData,
  dragOverlay = false,
  zIndex,
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
                'MatrixCard relative px-3 py-2 bg-white rounded text-xs w-[12vw] h-[8vw] bg-sticky-note-yellow leading-tight',
                'overflow-hidden select-none border-2 border-gray-50 transition-scale duration-200',
                resultsMode && 'cursor-pointer',
                className,
              )}
            >
              {text}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sticky-note-yellow to-transparent pointer-events-none" />
              {!resultsMode && (
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
              )}
            </motion.div>
          )}
        />
        {score && isDragging && (
          <Popover.Portal>
            <Popover.Positioner sideOffset={4} side="bottom" align="start" style={{ zIndex }}>
              <Popover.Popup className="text-xxs px-3 py-2 bg-gray-800 text-white rounded shadow-lg z-50">
                <span>Importance:</span>{' '}
                <span className="font-bold">
                  {toFixed(score.importance, 1)}/10
                </span>
                <br />
                <span>Complexity:</span>{' '}
                <span className="font-bold">
                  {toFixed(score.complexity, 1)}/10
                </span>
                <Popover.Arrow className="fill-gray-800" />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </Popover.Root>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
      >
        <Dialog.Portal>
          <AnimatePresence>
            {dialogOpen && (
              <>
                <Dialog.Backdrop
                  render={({
                    onDrag,
                    onDragStart,
                    onDragEnd,
                    onAnimationStart,
                    ...props
                  }) => (
                    <motion.div
                      {...props}
                      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                      animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
                      exit={{
                        opacity: 0,
                        backdropFilter: 'blur(0px)',
                        pointerEvents: 'none',
                      }}
                      className={cn('fixed inset-0 bg-black/50 z-[1000]')}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                      }}
                    />
                  )}
                />
                <Dialog.Popup
                  render={({
                    onDrag,
                    onDragStart,
                    onDragEnd,
                    onAnimationStart,
                    ...props
                  }) => (
                    <motion.div
                      {...props}
                      initial={{
                        scale: 0.8,
                        opacity: 0,
                        backdropFilter: 'blur(4px)',
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        backdropFilter: 'blur(0)',
                      }}
                      exit={{
                        scale: 0.8,
                        opacity: 0,
                        backdropFilter: 'blur(4px)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                      className={cn(
                        'fixed flex flex-col top-0 py-2 left-1/2 -translate-x-1/2 max-w-[99vw] sm:max-w-md w-full z-[9999]',
                        voteData
                          ? 'max-h-screen overflow-y-auto'
                          : 'min-h-[50vh]',
                      )}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <div className="flex-1 bg-sticky-note-yellow rounded px-6 py-4 mb-2">
                        <Dialog.Description className="text-base leading-relaxed whitespace-pre-wrap">
                          {text}
                        </Dialog.Description>
                      </div>

                      {voteData && (
                        <div className="pt-4 border-yellow-800/20 bg-background rounded px-6 py-4">
                          <h4 className="mb-3">
                            Voting statistics
                          </h4>

                          {/* Aggregated Scores */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-secondary rounded px-3 py-2">
                              <div className="text-xs text-gray-600 mb-1">
                                Avg. Importance
                              </div>
                              <div className="text-lg font-bold">
                                {toFixed(voteData.aggregated.importance, 1)}
                              </div>
                            </div>
                            <div className="bg-secondary rounded px-3 py-2">
                              <div className="text-xs text-gray-600 mb-1">
                                Avg. Complexity
                              </div>
                              <div className="text-lg font-bold">
                                {toFixed(voteData.aggregated.complexity, 1)}
                              </div>
                            </div>
                            <div className="bg-secondary rounded px-3 py-2">
                              <div className="text-xs text-gray-600 mb-1">
                                Importance Spread
                              </div>
                              <div className="text-lg font-bold">
                                {toFixed(
                                  voteData.aggregated.importanceSpread,
                                  1,
                                )}
                              </div>
                            </div>
                            <div className="bg-secondary rounded px-3 py-2">
                              <div className="text-xs text-gray-600 mb-1">
                                Complexity Spread
                              </div>
                              <div className="text-lg font-bold">
                                {toFixed(
                                  voteData.aggregated.complexitySpread,
                                  1,
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Individual Votes */}
                          <div>
                            <h5 className="mb-2">
                              Votes ({voteData.votes.length})
                            </h5>
                            <div className="space-y-2">
                              {voteData.votes.map((vote) => {
                                const user = voteData.users.find(
                                  (u) => u.id === vote.userId,
                                )
                                return (
                                  <div
                                    key={vote.userId}
                                    className="rounded flex items-center gap-3"
                                  >
                                    <UserAvatar
                                      name={user?.name || 'Unknown'}
                                      size="sm"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">
                                        {user?.name || 'Unknown'}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      I: {toFixed(vote.importance, 1)} • C:{' '}
                                      {toFixed(vote.complexity, 1)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <Dialog.Close className="absolute top-6.5 right-4 hover:scale-110 active:scale-95 transition-scale duration-100 cursor-pointer">
                        <XIcon size={24} />
                      </Dialog.Close>
                    </motion.div>
                  )}
                />
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
