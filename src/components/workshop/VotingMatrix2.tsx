import { useRef, useState } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDraggable,
  DragMoveEvent,
  type Modifier,
  ClientRect,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { RoomState, User, Vote } from '@/types/workshop'
import { MATRIX_LAYOUT_DROPPABLE_ID, MatrixLayout } from './MatrixLayout'
import { MatrixCard } from './MatrixCard'
import { restrictToBoundingRect } from '@/lib/dnd'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'
import { normalize } from '@/lib/normalize'
import { CheckIcon } from '@phosphor-icons/react'
import { getCardColorFromName } from '@/lib/avatar'

type VotingMatrixProps = {
  room: RoomState
  currentUser: User
  onVote: (vote: Vote) => void
}

function calculateRelativePosition(
  matrixLayoutRect: ClientRect,
  rect: ClientRect,
) {
  // calculate relative position
  const relativeLeft = rect.left - matrixLayoutRect.left
  const relativeTop = rect.top - matrixLayoutRect.top

  // calculate percentage position (top-left corner)
  const percentLeft = (relativeLeft / matrixLayoutRect.width) * 100
  const percentTop = (relativeTop / matrixLayoutRect.height) * 100

  // calculate percentage position (containment area)
  const containmentWidth = matrixLayoutRect.width - rect.width
  const containmentHeight = matrixLayoutRect.height - rect.height

  const containmentPercentLeft = (relativeLeft / containmentWidth) * 100
  const containmentPercentTop = (relativeTop / containmentHeight) * 100

  const isInsideContainment =
    containmentPercentLeft >= 0 &&
    containmentPercentLeft <= 100 &&
    containmentPercentTop >= 0 &&
    containmentPercentTop <= 100

  return {
    percentLeft,
    percentTop,
    containmentPercentLeft,
    containmentPercentTop,
    isInsideContainment,
  }
}

function calculateScore(
  containmentPercentTop: number,
  containmentPercentLeft: number,
) {
  const importancePercentage = 100 - containmentPercentTop
  const complexityPercentage = containmentPercentLeft

  return {
    importance: normalize(importancePercentage, 0, 100, 1, 10),
    complexity: normalize(complexityPercentage, 0, 100, 1, 10),
  }
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
    if (room.anonymousVotes) {
      return 'var(--color-sticky-note-yellow)'
    }
    const author = room.users.find((u) => u.id === authorId)
    return author ? getCardColorFromName(author.name) : 'var(--color-sticky-note-yellow)'
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

    // setCoordinates({
    //   x: `${percentLeft}%`,
    //   y: `${percentTop}%`,
    // })

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
        isInsideContainmentRef.current = (true)
      } else {
        setActiveScore(null)
      }
    }
  }

  return (
    <div className="flex-1 p-6 flex flex gap-4 h-full overflow-y-hidden">
      <DndContext
        modifiers={[restrictToMatrixLayout, restrictToWindowEdges]}
        sensors={sensors}
        onDragStart={(event) => {
          if (typeof event.active.id === 'string') {
            const card = cardsWithOptimisticVotes.find(
              (card) => card.id === event.active.id,
            )
            if (card) {
              setCoordinates({
                x: `${card.votes.find((v) => v.userId === currentUser.id)?.x ?? 0}%`,
                y: `${card.votes.find((v) => v.userId === currentUser.id)?.y ?? 0}%`,
              })
              setActiveCard(card)
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
              />
            )
          })}
        </MatrixLayout>

        <div className="w-[12vw] flex flex-col items-center">
          <h3 className="font-semibold mb-4 text-center">
            To vote ({votedCards.length}/{cardsWithOptimisticVotes.length})
          </h3>
          <div className="flex flex-col gap-2 justify-center">
            {availableCards.map((card) => {
              const isActive = card.id === activeCard?.id
              return (
                <DraggableCard
                  key={card.id}
                  card={card}
                  score={isActive ? activeScore : null}
                  zIndex={201}
                  authorColor={getAuthorColor(card.authorId)}
                />
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
        {/* <DragOverlay
          style={{
            left: x,
            top: y,
          } as React.CSSProperties}
          dropAnimation={{
            duration: 250,
            easing:
              'linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1)',
            keyframes({ transform }) {
              return [
                { transform: CSS.Transform.toString(transform.initial) },
                { transform: CSS.Transform.toString(transform.final) },
              ]
            },
            sideEffects: defaultDropAnimationSideEffects({
              className: {
                active: 'opacity-0',
              },
            }),
          }}
        >
          {activeCard && (
            <MatrixCard
              text={activeCard.text}
              score={activeScore}
              isDragging
              dragOverlay
            />
            // <DraggableCard
            //   key={activeId}
            //   card={
            //     cardsWithOptimisticVotes.find((card) => card.id === activeId)!
            //   }
            //   score={activeScore}
            // />
          )}
        </DragOverlay> */}
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
}

function DraggableCard({ card, x, y, score, zIndex, authorColor }: DraggableCardProps) {
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
      <MatrixCard text={card.text} score={score} isDragging={isDragging} zIndex={zIndex} authorColor={authorColor} />
    </div>
  )
}
