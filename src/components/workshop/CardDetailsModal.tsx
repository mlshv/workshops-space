import { Dialog } from '@base-ui-components/react/dialog'
import { XIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import type { Vote, User } from '@/types/workshop'
import type { AggregatedScore } from '@/lib/aggregateVotes'
import { UserAvatar } from './UserAvatar'
import { toFixed } from '@/lib/to-fixed'

type CardDetailsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
  authorColor?: string
  anonymousVotes?: boolean
  voteData?: {
    votes: Vote[]
    users: User[]
    aggregated: AggregatedScore
  }
}

export function CardDetailsModal({
  open,
  onOpenChange,
  text,
  authorColor = 'var(--color-sticky-note-yellow)',
  anonymousVotes = false,
  voteData,
}: CardDetailsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
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
                    <div
                      className="flex-1 rounded px-6 py-4 mb-2"
                      style={{ backgroundColor: authorColor }}
                    >
                      <Dialog.Description className="text-base leading-relaxed whitespace-pre-wrap">
                        {text}
                      </Dialog.Description>
                    </div>

                    {voteData && (
                      <div className="pt-4 bg-background rounded px-6 py-4">
                        <h4 className="mb-3">Voting statistics</h4>

                        {/* Aggregated Scores */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-secondary rounded px-3 py-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Avg. Importance
                            </div>
                            <div className="text-lg font-medium">
                              {toFixed(voteData.aggregated.importance, 1)}
                            </div>
                          </div>
                          <div className="bg-secondary rounded px-3 py-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Avg. Complexity
                            </div>
                            <div className="text-lg font-medium">
                              {toFixed(voteData.aggregated.complexity, 1)}
                            </div>
                          </div>
                          <div className="bg-secondary rounded px-3 py-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Importance Spread
                            </div>
                            <div className="text-lg font-medium">
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
                            <div className="text-lg font-medium">
                              {toFixed(
                                voteData.aggregated.complexitySpread,
                                1,
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Individual Votes */}
                        {!anonymousVotes && (
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
                                    className="rounded flex items-center gap-2"
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
                                      Importance: {toFixed(vote.importance, 1)} • Complexity:{' '}
                                      {toFixed(vote.complexity, 1)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Dialog.Close className="absolute top-6.5 right-4 hover:scale-110 active:scale-95 transition-scale duration-100 cursor-pointer">
                      <XIcon className="w-5.5 h-5.5" />
                    </Dialog.Close>
                  </motion.div>
                )}
              />
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
