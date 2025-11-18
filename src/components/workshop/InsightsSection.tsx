import type { AggregatedScore } from '@/lib/aggregateVotes'
import type { Card, RoomState } from '@/types/workshop'
import { toFixed } from '@/lib/to-fixed'
import { MatrixCard } from './MatrixCard'
import { getCardColorFromName } from '@/lib/avatar'
import React from 'react'

type InsightsSectionProps = {
  positions: Array<{
    card: Card
    aggregated: AggregatedScore
  }>
  room: RoomState
}

export function InsightsSection({ positions, room }: InsightsSectionProps) {
  const getAuthorColor = (authorId: string): string => {
    const author = room.users.find((u) => u.id === authorId)
    return author
      ? getCardColorFromName(author.name)
      : 'var(--color-sticky-note-yellow)'
  }

  // Count high priority items (importance >= 7)
  const highPriorityCount = positions.filter(
    (pos) => pos.aggregated.importance >= 7,
  ).length

  // Find most controversial card (highest combined spread)
  const mostControversial = positions.reduce<{
    card: Card
    aggregated: AggregatedScore
  } | null>((max, pos) => {
    const totalSpread =
      pos.aggregated.importanceSpread + pos.aggregated.complexitySpread
    const maxSpread = max
      ? max.aggregated.importanceSpread + max.aggregated.complexitySpread
      : 0
    return totalSpread > maxSpread ? pos : max
  }, null)

  // Find most agreed card (lowest combined spread)
  const mostAgreed = positions.reduce<{
    card: Card
    aggregated: AggregatedScore
  } | null>((min, pos) => {
    const totalSpread =
      pos.aggregated.importanceSpread + pos.aggregated.complexitySpread
    const minSpread = min
      ? min.aggregated.importanceSpread + min.aggregated.complexitySpread
      : Infinity
    return totalSpread < minSpread ? pos : min
  }, null)

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-2">Insights</h3>
      <div className="grid grid-cols-4 gap-4">
        <InsightCard
          title="High priority"
          value={
            <>
              <span className="text-4xl leading-tight">
                {highPriorityCount.toString()}
              </span>
              <span className="text-muted-foreground text-xs font-normal">{` card${highPriorityCount !== 1 ? 's' : ''}`}</span>{' '}
            </>
          }
          subtitle={`Importance ≥ 7`}
        />
        <InsightCard
          title="Most controversial"
          value={
            mostControversial ? (
              <MatrixCard
                text={mostControversial.card.text}
                score={{
                  importance: mostControversial.aggregated.importance,
                  complexity: mostControversial.aggregated.complexity,
                }}
                resultsMode={true}
                anonymousVotes={room.anonymousVotes}
                voteData={{
                  votes: mostControversial.card.votes,
                  users: room.users,
                  aggregated: mostControversial.aggregated,
                }}
                authorColor={getAuthorColor(mostControversial.card.authorId)}
              />
            ) : (
              'N/A'
            )
          }
          subtitle={
            mostControversial
              ? `Spread: ${toFixed(mostControversial.aggregated.importanceSpread + mostControversial.aggregated.complexitySpread, 1)}`
              : 'No data'
          }
        />
        <InsightCard
          title="Most agreed"
          value={
            mostAgreed ? (
              <MatrixCard
                text={mostAgreed.card.text}
                score={{
                  importance: mostAgreed.aggregated.importance,
                  complexity: mostAgreed.aggregated.complexity,
                }}
                resultsMode={true}
                anonymousVotes={room.anonymousVotes}
                voteData={{
                  votes: mostAgreed.card.votes,
                  users: room.users,
                  aggregated: mostAgreed.aggregated,
                }}
                authorColor={getAuthorColor(mostAgreed.card.authorId)}
              />
            ) : (
              'N/A'
            )
          }
          subtitle={
            mostAgreed
              ? `Spread: ${toFixed(mostAgreed.aggregated.importanceSpread + mostAgreed.aggregated.complexitySpread, 1)}`
              : 'No data'
          }
        />
      </div>
    </div>
  )
}

type InsightCardProps = {
  title: string
  value: React.ReactNode
  subtitle?: string
  isText?: boolean
}

function InsightCard({ title, value, subtitle = '' }: InsightCardProps) {
  return (
    <div className="bg-background border border-border p-4 flex flex-col justify-between">
      <div className="mb-2">{title}</div>
      <div className="mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  )
}
