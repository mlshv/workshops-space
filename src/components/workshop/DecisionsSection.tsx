import { useState, useMemo } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import type { RoomState, Card } from '@/types/workshop'
import type { AggregatedScore } from '@/lib/aggregateVotes'
import { cn } from '@/lib/utils'

type DecisionsSectionProps = {
  positions: Array<{
    card: Card
    aggregated: AggregatedScore
  }>
  room: RoomState
}

type DecisionItem = {
  id: string
  text: string
  source: 'card' | 'insight' | 'suggestion'
}

export function DecisionsSection({ positions, room }: DecisionsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const items = useMemo<DecisionItem[]>(() => {
    const result: DecisionItem[] = []

    // Add high-priority cards (importance >= 7)
    const sorted = [...positions].sort(
      (a, b) => b.aggregated.importance - a.aggregated.importance,
    )
    for (const pos of sorted) {
      result.push({
        id: `card-${pos.card.id}`,
        text: pos.card.text,
        source: 'card',
      })
    }

    // Add AI insights if available
    if (room.aiSummary?.keyInsights) {
      for (const [i, insight] of room.aiSummary.keyInsights.entries()) {
        result.push({
          id: `insight-${i}`,
          text: insight,
          source: 'insight',
        })
      }
    }

    // Add AI suggestions if available
    if (room.aiSummary?.aiSuggestions) {
      for (const [i, suggestion] of room.aiSummary.aiSuggestions.entries()) {
        result.push({
          id: `suggestion-${i}`,
          text: suggestion,
          source: 'suggestion',
        })
      }
    }

    return result
  }, [positions, room.aiSummary])

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (items.length === 0) return null

  const sourceLabel = (source: DecisionItem['source']) => {
    switch (source) {
      case 'card':
        return 'Card'
      case 'insight':
        return 'Insight'
      case 'suggestion':
        return 'Suggestion'
    }
  }

  const sourceColor = (source: DecisionItem['source']) => {
    switch (source) {
      case 'card':
        return 'bg-amber-100 text-amber-700'
      case 'insight':
        return 'bg-blue-100 text-blue-700'
      case 'suggestion':
        return 'bg-purple-100 text-purple-700'
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Decisions</h3>
        <span className="text-xs text-muted-foreground">
          {selectedIds.size} selected
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        What's most important to remember? Select the key takeaways.
      </p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                'w-full flex items-start gap-2.5 px-3 py-2 rounded border text-left text-sm transition-colors duration-150 clickable',
                isSelected
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-border bg-white hover:bg-foreground/5',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150',
                  isSelected
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-border',
                )}
              >
                {isSelected && (
                  <CheckIcon className="size-3 text-white" weight="bold" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="line-clamp-2">{item.text}</span>
              </div>
              <span
                className={cn(
                  'flex-shrink-0 text-[0.65rem] px-1.5 py-0.5 rounded-full font-medium',
                  sourceColor(item.source),
                )}
              >
                {sourceLabel(item.source)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
