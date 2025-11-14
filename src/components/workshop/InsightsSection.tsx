import type { AggregatedScore } from '@/lib/aggregateVotes'
import type { Card, RoomState } from '@/types/workshop'
import { toFixed } from '@/lib/to-fixed'
import { MatrixCard } from './MatrixCard'
import React from 'react'

type InsightsSectionProps = {
  positions: Array<{
    card: Card
    aggregated: AggregatedScore
  }>
  room: RoomState
}

export function InsightsSection({ positions, room }: InsightsSectionProps) {
  // Calculate average importance
  const avgImportance =
    positions.length > 0
      ? positions.reduce((sum, pos) => sum + pos.aggregated.importance, 0) /
        positions.length
      : 0

  // Calculate average complexity
  const avgComplexity =
    positions.length > 0
      ? positions.reduce((sum, pos) => sum + pos.aggregated.complexity, 0) /
        positions.length
      : 0

  // Count high priority items (importance >= 7)
  const highPriorityCount = positions.filter(
    (pos) => pos.aggregated.importance >= 7,
  ).length

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Insights</h3>
      <div className="grid grid-cols-3 gap-4">
        <InsightCard
          title="Avg. importance"
          value={toFixed(avgImportance, 1)}
          subtitle="out of 10"
        />
        <InsightCard
          title="Avg. complexity"
          value={toFixed(avgComplexity, 1)}
          subtitle="out of 10"
        />
        <InsightCard
          title="High priority"
          value={
            <>
              {highPriorityCount.toString()}
              <span className="text-gray-500 text-xs font-normal">{` card${highPriorityCount !== 1 ? 's' : ''}`}</span>{' '}
            </>
          }
          subtitle={`Importance ≥ 7`}
        />
      </div>
    </div>
  )
}

type InsightCardProps = {
  title: string
  value: React.ReactNode
  subtitle: string
  isText?: boolean
}

function InsightCard({
  title,
  value,
  subtitle,
  isText = false,
}: InsightCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div
        className={`font-medium mb-1 ${isText ? 'text-base leading-tight' : 'text-3xl'}`}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}
