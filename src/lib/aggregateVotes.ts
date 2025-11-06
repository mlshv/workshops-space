import type { Vote } from '@/types/workshop'

export type AggregatedScore = {
  importance: number
  complexity: number
  voteCount: number
  importanceSpread: number
  complexitySpread: number
  hasHighDisagreement: boolean
  method: 'single' | 'mean' | 'median' | 'trimmed-mean'
}

/**
 * Calculate median of an array of numbers
 */
function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Calculate trimmed mean (removes extreme values from both ends)
 * @param values Array of numbers
 * @param trimPercent Percentage to trim from each end (default 0.2 = 20% total, 10% each end)
 */
function getTrimmedMean(values: number[], trimPercent: number = 0.2): number {
  const sorted = [...values].sort((a, b) => a - b)
  const trimCount = Math.floor(sorted.length * (trimPercent / 2))

  if (trimCount === 0) {
    // Not enough data to trim, use regular mean
    return sorted.reduce((sum, v) => sum + v, 0) / sorted.length
  }

  const trimmed = sorted.slice(trimCount, sorted.length - trimCount)
  return trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length
}

/**
 * Calculate arithmetic mean
 */
function getMean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/**
 * Calculate the spread (range) of values
 */
function getSpread(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(...values) - Math.min(...values)
}

/**
 * Aggregate votes using adaptive algorithm based on vote count
 * - 1 vote: Use that vote directly
 * - 2 votes: Simple arithmetic mean
 * - 3-4 votes: Median (robust for small samples)
 * - 5+ votes: Trimmed mean (20% trim)
 */
export function aggregateVotes(votes: Vote[]): AggregatedScore {
  // Default values when no votes
  if (votes.length === 0) {
    return {
      importance: 5,
      complexity: 5,
      voteCount: 0,
      importanceSpread: 0,
      complexitySpread: 0,
      hasHighDisagreement: false,
      method: 'single',
    }
  }

  const importanceValues = votes.map(v => v.importance)
  const complexityValues = votes.map(v => v.complexity)

  const importanceSpread = getSpread(importanceValues)
  const complexitySpread = getSpread(complexityValues)

  // High disagreement if spread is more than 3 points on 1-10 scale
  const hasHighDisagreement = importanceSpread > 3 || complexitySpread > 3

  // Single vote - use it directly
  if (votes.length === 1) {
    return {
      importance: votes[0].importance,
      complexity: votes[0].complexity,
      voteCount: 1,
      importanceSpread,
      complexitySpread,
      hasHighDisagreement: false,
      method: 'single',
    }
  }

  // Two votes - simple mean
  if (votes.length === 2) {
    return {
      importance: getMean(importanceValues),
      complexity: getMean(complexityValues),
      voteCount: 2,
      importanceSpread,
      complexitySpread,
      hasHighDisagreement,
      method: 'mean',
    }
  }

  // 3-4 votes - median (most robust for small samples)
  if (votes.length <= 4) {
    return {
      importance: getMedian(importanceValues),
      complexity: getMedian(complexityValues),
      voteCount: votes.length,
      importanceSpread,
      complexitySpread,
      hasHighDisagreement,
      method: 'median',
    }
  }

  // 5+ votes - trimmed mean (remove top and bottom 10%)
  return {
    importance: getTrimmedMean(importanceValues),
    complexity: getTrimmedMean(complexityValues),
    voteCount: votes.length,
    importanceSpread,
    complexitySpread,
    hasHighDisagreement,
    method: 'trimmed-mean',
  }
}
