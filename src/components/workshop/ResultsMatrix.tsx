import { useState } from 'react'
import type { RoomState, Card } from '@/types/workshop'
import { MatrixLayout } from './MatrixLayout'
import { MatrixCard } from './MatrixCard'
import { InsightsSection } from './InsightsSection'
import { ItemsTable } from './ItemsTable'
import { AISummary } from './AISummary'
import { aggregateVotes, type AggregatedScore } from '@/lib/aggregateVotes'
import { normalize } from '@/lib/normalize'
import type { RoomConnection } from '@/lib/partykit'
import { getCardColorFromName } from '@/lib/avatar'
import {
  calculatePositionFromContainment,
  CARD_DIMENSIONS,
} from '@/lib/matrix-position'

type ResultsMatrixProps = {
  room: RoomState
  connection: RoomConnection
  isAdmin: boolean
}

type CardPosition = {
  card: Card
  x: number
  y: number
  aggregated: AggregatedScore
}

export default function ResultsMatrix({
  room,
  connection,
  isAdmin,
}: ResultsMatrixProps) {
  const positions = calculatePositions(room.cards)
  const [hoverOrder, setHoverOrder] = useState<string[]>([])

  const handleCardHover = (cardId: string) => {
    setHoverOrder((prev) => {
      // Remove card if it exists, then add to end
      const filtered = prev.filter((id) => id !== cardId)
      return [...filtered, cardId]
    })
  }

  const getZIndex = (cardId: string, baseIndex: number): number => {
    const hoverIndex = hoverOrder.indexOf(cardId)
    if (hoverIndex === -1) {
      // Card hasn't been hovered yet, use base index
      return baseIndex
    }
    // Card has been hovered, use position in hover order (starting from 100)
    return 100 + hoverIndex
  }

  const getAuthorColor = (authorId: string): string => {
    const author = room.users.find((u) => u.id === authorId)
    return author
      ? getCardColorFromName(author.name)
      : 'var(--color-sticky-note-yellow)'
  }

  return (
    <div className="flex-1 py-6 px-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-medium">Results 🔒</h2>
        <div className="text-sm text-muted-foreground">
          {positions.length} card{positions.length !== 1 ? 's' : ''} voted on
        </div>
      </div>

      <div className="min-h-[80vh] flex flex-col">
        <MatrixLayout>
          {positions.map((pos, index) => (
            <div
              key={pos.card.id}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: getZIndex(pos.card.id, index),
              }}
              onMouseEnter={() => handleCardHover(pos.card.id)}
              className="absolute"
            >
              <MatrixCard
                text={pos.card.text}
                score={{
                  importance: pos.aggregated.importance,
                  complexity: pos.aggregated.complexity,
                }}
                resultsMode={true}
                anonymousVotes={room.anonymousVotes}
                voteData={{
                  votes: pos.card.votes,
                  users: room.users,
                  aggregated: pos.aggregated,
                }}
                authorColor={getAuthorColor(pos.card.authorId)}
              />
            </div>
          ))}
        </MatrixLayout>
      </div>

      <InsightsSection positions={positions} room={room} />

      <div className="mt-8 flex gap-3">
        <div className="w-3/4">
          <ItemsTable positions={positions} room={room} connection={connection} />
        </div>
        <div>
          <AISummary room={room} connection={connection} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  )
}

function calculatePositions(cards: Card[]): CardPosition[] {
  return cards
    .map((card) => {
      const aggregated = aggregateVotes(card.votes)

      // Skip cards with no votes
      if (aggregated.voteCount === 0) {
        return null
      }

      // Convert aggregated scores (1-10) to containment percentages (0-100)
      const containmentPercentLeft = normalize(aggregated.complexity, 1, 10, 0, 100)
      // Importance: invert because higher importance = higher on screen (lower y)
      const containmentPercentTop = 100 - normalize(aggregated.importance, 1, 10, 0, 100)

      // Convert containment percentages to visual position (top-left corner)
      // This matches the coordinate system used in VotingMatrix
      const { percentLeft, percentTop } = calculatePositionFromContainment(
        containmentPercentLeft,
        containmentPercentTop,
        CARD_DIMENSIONS.widthPercent,
        CARD_DIMENSIONS.heightPercent,
      )

      return {
        card,
        x: percentLeft,
        y: percentTop,
        aggregated,
      }
    })
    .filter((pos): pos is CardPosition => pos !== null)
}
