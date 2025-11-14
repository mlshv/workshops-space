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
import { FileLockIcon, LockSimpleIcon } from '@phosphor-icons/react'

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
    if (room.anonymousVotes) {
      return 'var(--color-sticky-note-yellow)'
    }
    const author = room.users.find((u) => u.id === authorId)
    return author
      ? getCardColorFromName(author.name)
      : 'var(--color-sticky-note-yellow)'
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-4xl font-medium">Results</h2>
          <FileLockIcon className="size-7" />
        </div>
        <div className="text-sm text-gray-600">
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
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <MatrixCard
                text={pos.card.text}
                score={{
                  importance: pos.aggregated.importance,
                  complexity: pos.aggregated.complexity,
                }}
                resultsMode={true}
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
      <ItemsTable positions={positions} room={room} connection={connection} />
      <AISummary room={room} connection={connection} isAdmin={isAdmin} />
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

      // Convert aggregated scores (1-10) to percentage position (0-100)
      // Complexity: 1-10 maps to 0-100 left-to-right
      const x = normalize(aggregated.complexity, 1, 10, 0, 100)
      // Importance: 1-10 maps to 100-0 top-to-bottom (inverted)
      const y = 100 - normalize(aggregated.importance, 1, 10, 0, 100)

      return {
        card,
        x: Math.max(5, Math.min(95, x)), // Keep cards within visible bounds
        y: Math.max(5, Math.min(95, y)),
        aggregated,
      }
    })
    .filter((pos): pos is CardPosition => pos !== null)
}
