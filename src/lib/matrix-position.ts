import type { ClientRect } from '@dnd-kit/core'
import { normalize } from './normalize'

/**
 * Calculates the relative position of a card within a matrix layout.
 * Returns both visual position (top-left corner) and containment-based position.
 *
 * @param matrixLayoutRect - The bounding rectangle of the matrix container
 * @param rect - The bounding rectangle of the card being positioned
 * @returns Position data including visual and containment percentages
 */
export function calculateRelativePosition(
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

/**
 * Calculates visual position (top-left corner) from containment-based percentages.
 * This is the reverse operation of calculateRelativePosition's containment calculation.
 *
 * @param containmentPercentLeft - Horizontal position within containment area (0-100)
 * @param containmentPercentTop - Vertical position within containment area (0-100)
 * @param cardWidthPercent - Card width as percentage of container (e.g., 12)
 * @param cardHeightPercent - Card height as percentage of container (e.g., 10)
 * @returns Visual position percentages for top-left corner
 */
export function calculatePositionFromContainment(
  containmentPercentLeft: number,
  containmentPercentTop: number,
  cardWidthPercent: number,
  cardHeightPercent: number,
) {
  // containmentPercentLeft represents position within (100% - cardWidth) space
  // Convert to actual visual position (top-left corner)
  const percentLeft = (containmentPercentLeft / 100) * (100 - cardWidthPercent)
  const percentTop = (containmentPercentTop / 100) * (100 - cardHeightPercent)

  return {
    percentLeft,
    percentTop,
  }
}

/**
 * Calculates importance and complexity scores (1-10 scale) from containment percentages.
 * Importance increases from bottom to top, complexity increases from left to right.
 *
 * @param containmentPercentTop - Vertical position within containment area (0-100)
 * @param containmentPercentLeft - Horizontal position within containment area (0-100)
 * @returns Scores on 1-10 scale for importance and complexity
 */
export function calculateScore(
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

/**
 * Card dimensions as percentages of the matrix container.
 * These are estimates based on typical card sizes relative to the matrix.
 */
export const CARD_DIMENSIONS = {
  widthPercent: 12,
  heightPercent: 10,
} as const
