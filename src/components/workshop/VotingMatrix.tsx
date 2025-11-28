import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDraggable,
  DragMoveEvent,
  type Modifier,
} from '@dnd-kit/core'
import type { RoomState, User, Vote } from '@/types/workshop'
import { MATRIX_LAYOUT_DROPPABLE_ID, MatrixLayout } from './MatrixLayout'
import { MatrixCard } from './MatrixCard'
import { restrictToBoundingRect } from '@/lib/dnd'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@phosphor-icons/react'
import {
  calculateRelativePosition,
  calculateScore,
} from '@/lib/matrix-position'
import { DraggableOverlay } from './DraggableOverlay'

type VotingMatrixProps = {
  room: RoomState
  currentUser: User
  onVote: (vote: Vote) => void
}

export default function VotingMatrix2({
  room,
  currentUser,
  onVote,
}: VotingMatrixProps) {
  const [activeCard, setActiveCard] = useState<{
    id: string
    text: string
    authorId: string
    currentUserVote?: Vote
  } | null>(null)
  const [activeScore, setActiveScore] = useState<{
    importance: number
    complexity: number
  } | null>(null)
  const [{ x, y }, setCoordinates] = useState<{
    x: number | string
    y: number | string
  }>({
    x: 0,
    y: 0,
  })
  const matrixLayoutRef = useRef<HTMLDivElement>(null)
  const isInsideContainmentRef = useRef(false)

  const [optimisticVotes, setOptimisticVotes] = useState<Map<string, Vote>>(
    new Map(),
  )

  const sensors = useSensors(useSensor(PointerSensor))

  const getAuthorColor = (authorId: string): string => {
    const author = room.users.find((u) => u.id === authorId)
    return author?.cardColor || 'var(--color-sticky-note-yellow)'
  }

  const restrictToMatrixLayout: Modifier = ({
    over,
    transform,
    draggingNodeRect,
    active,
  }) => {
    if (!draggingNodeRect || !active || !over) {
      return transform
    }

    const activeId = active.id
    const isVotedCard = votedCards.some((card) => card.id === activeId)
    const matrixLayoutRect = over.rect

    if (!isVotedCard && !isInsideContainmentRef.current) {
      return transform
    }

    return restrictToBoundingRect(transform, draggingNodeRect, matrixLayoutRect)
  }

  // Merge optimistic votes with actual votes from the room state
  const cardsWithOptimisticVotes = room.cards.map((card) => {
    const optimisticVote = optimisticVotes.get(card.id)
    if (optimisticVote) {
      // replace existing vote or add new one
      const votesWithoutCurrentUser = card.votes.filter(
        (v) => v.userId !== currentUser.id,
      )
      return {
        ...card,
        votes: [...votesWithoutCurrentUser, optimisticVote],
      }
    }
    return card
  })

  const availableCards = cardsWithOptimisticVotes.filter((card) => {
    return !card.votes.some((vote) => vote.userId === currentUser.id)
  })

  // Cards that have been voted on by current user
  const votedCards = cardsWithOptimisticVotes.filter((card) => {
    return card.votes.some((vote) => vote.userId === currentUser.id)
  })

  // Sort voted cards by timestamp for z-index calculation
  const sortedVotedCards = [...votedCards].sort((a, b) => {
    const voteA = a.votes.find((v) => v.userId === currentUser.id)
    const voteB = b.votes.find((v) => v.userId === currentUser.id)
    return (voteA?.timestamp ?? 0) - (voteB?.timestamp ?? 0)
  })

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.delta.x === 0 && event.delta.y === 0) {
      return
    }

    const cardId = event.active.id
    setActiveCard(null)
    setActiveScore(null)
    isInsideContainmentRef.current = false

    const matrixLayoutRect = event.over?.rect ?? null
    const rect = event.active.rect.current.translated

    if (event.over?.id !== MATRIX_LAYOUT_DROPPABLE_ID) {
      return
    }

    if (!matrixLayoutRect || !rect || typeof cardId !== 'string') {
      return
    }

    const {
      percentLeft,
      percentTop,
      containmentPercentLeft,
      containmentPercentTop,
      isInsideContainment,
    } = calculateRelativePosition(matrixLayoutRect, rect)

    if (!isInsideContainment) {
      return
    }

    // Create vote with position data
    const vote: Vote = {
      userId: currentUser.id,
      cardId: cardId,
      x: percentLeft,
      y: percentTop,
      ...calculateScore(containmentPercentTop, containmentPercentLeft),
      timestamp: Date.now(),
    }

    // Optimistic update
    setOptimisticVotes((prev) => {
      const next = new Map(prev)
      next.set(cardId, vote)
      return next
    })

    // Send to server
    onVote(vote)

    // Clean up optimistic vote after server responds
    setTimeout(() => {
      setOptimisticVotes((prev) => {
        const next = new Map(prev)
        next.delete(cardId)
        return next
      })
    }, 1000)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (event.delta.x === 0 && event.delta.y === 0) {
      return
    }

    const matrixLayoutRect = event.over?.rect ?? null
    const rect = event.active.rect.current.translated

    if (rect && matrixLayoutRect) {
      const {
        containmentPercentLeft,
        containmentPercentTop,
        isInsideContainment,
      } = calculateRelativePosition(matrixLayoutRect, rect)

      if (isInsideContainment) {
        setActiveScore(
          calculateScore(containmentPercentTop, containmentPercentLeft),
        )
        isInsideContainmentRef.current = true
      } else {
        setActiveScore(null)
      }
    }
  }

  return (
    <div className="flex-1 flex flex h-full overflow-y-hidden">
      <DndContext
        modifiers={[restrictToMatrixLayout, restrictToWindowEdges]}
        sensors={sensors}
        onDragStart={(event) => {
          if (typeof event.active.id === 'string') {
            const card = cardsWithOptimisticVotes.find(
              (card) => card.id === event.active.id,
            )
            if (card) {
              const vote = card.votes.find((v) => v.userId === currentUser.id)
              setCoordinates({
                x: `${vote?.x ?? 0}%`,
                y: `${vote?.y ?? 0}%`,
              })

              setActiveCard({ ...card, currentUserVote: vote })
            }
          }
        }}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <MatrixLayout ref={matrixLayoutRef}>
          {sortedVotedCards.map((card, index) => {
            const vote = card.votes.find((v) => v.userId === currentUser.id)
            const isActive = card.id === activeCard?.id

            return (
              <DraggableCard
                key={card.id}
                card={card}
                x={isActive ? x : `${vote?.x}%`}
                y={isActive ? y : `${vote?.y}%`}
                score={isActive ? activeScore : (vote ?? null)}
                zIndex={isActive ? sortedVotedCards.length + 1 : index}
                authorColor={getAuthorColor(card.authorId)}
                className="hover:brightness-103"
              />
            )
          })}
        </MatrixLayout>

        <div className="w-[13vw] flex flex-col items-center p-2 overflow-y-scroll border-l border-border">
          <h3 className="font-medium mb-2 text-center">
            To vote ({votedCards.length}/{cardsWithOptimisticVotes.length})
          </h3>
          <div className="flex flex-col justify-center -space-y-8">
            {availableCards.map((card) => {
              const isActive = card.id === activeCard?.id
              return (
                <motion.div
                  className="relative hover:z-1 hover:shadow-lg hover:brightness-103"
                  whileHover={{ rotate: isActive ? 0 : 2, scale: isActive ? 1 : 1.05 }}
                >
                  <DraggableCard
                    key={card.id}
                    card={card}
                    score={isActive ? activeScore : null}
                    zIndex={201}
                    authorColor={getAuthorColor(card.authorId)}
                    className="hover:border-transparent border-2 border-background shadow-none"
                  />
                </motion.div>
              )
            })}
          </div>
          {availableCards.length === 0 && (
            <p className="text-sm text-center">
              <CheckIcon className="mx-auto mb-2" size={24} />
              All cards have been voted on
            </p>
          )}
        </div>
        <DraggableOverlay>
          {activeCard && (
            <motion.div
              className={cn(
                'flex shadow-lg hover:brightness-103 origin-center rounded',
              )}
              animate={{
                rotate: 0,
                scale: 1,
              }}
              initial={{
                rotate: activeCard.currentUserVote ? 0 : 2,
                scale: activeCard.currentUserVote ? 1 : 1.05,
              }}
            >
              <MatrixCard
                text={activeCard.text}
                score={activeScore}
                isDragging
                dragOverlay
                authorColor={getAuthorColor(activeCard.authorId)}
                className="border-transparent"
              />
            </motion.div>
          )}
        </DraggableOverlay>
      </DndContext>
    </div>
  )
}

type DraggableCardProps = {
  card: { id: string; text: string; authorId: string }
  x?: number | string
  y?: number | string
  score: { importance: number; complexity: number } | null
  zIndex?: number
  authorColor?: string
  className?: string
}

function DraggableCard({
  card,
  x,
  y,
  score,
  zIndex,
  authorColor,
  className,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
    })

  const style = isDragging
    ? {
        transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
        left: x,
        top: y,
        zIndex,
        opacity: 0.5,
      }
    : {
        left: x,
        top: y,
        zIndex,
      }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-move',
        x !== undefined && y !== undefined && 'absolute',
      )}
    >
      <MatrixCard
        text={card.text}
        score={score}
        isDragging={isDragging}
        zIndex={zIndex}
        authorColor={authorColor}
        className={className}
      />
    </div>
  )
}
