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

export default function ResultsMatrix({ room, connection, isAdmin }: ResultsMatrixProps) {
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

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Results</h2>
        <div className="text-sm text-gray-600">
          {positions.length} card{positions.length !== 1 ? 's' : ''} voted on
        </div>
      </div>

      <div className="min-h-[80vh] flex flex-col">
        <MatrixLayout>
          {positions.map((pos, index) => {
            const borderColor = pos.aggregated.hasHighDisagreement
              ? 'border-orange-400'
              : 'border-gray-50'

            return (
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
                  className={`max-w-[200px] border-2 ${borderColor}`}
                  voteData={{
                    votes: pos.card.votes,
                    users: room.users,
                    aggregated: pos.aggregated,
                  }}
                />
                {pos.aggregated.hasHighDisagreement && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xxs px-2 py-0.5 rounded-full font-semibold cursor-default select-none">
                    High disagreement
                  </div>
                )}
              </div>
            )
          })}
        </MatrixLayout>
      </div>

      <InsightsSection positions={positions} />
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
