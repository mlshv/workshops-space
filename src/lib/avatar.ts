/**
 * Golden Angle constant for optimal color distribution
 * Using golden ratio to maximize perceptual distance between sequential colors
 */
const GOLDEN_ANGLE = 137.5077640500378

/**
 * Generates a hue value from an index using the Golden Angle approach
 * This ensures each sequential index gets the most distinct color from previous ones
 */
function getHueFromIndex(index: number): number {
  return (index * GOLDEN_ANGLE) % 360
}

/**
 * Generates a vibrant HSL color for avatars from a color index
 * Uses higher saturation and medium lightness for visibility
 */
export function getColorFromIndex(index: number): string {
  const hue = getHueFromIndex(index)
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Generates a light HSL color for card backgrounds from a color index
 * Uses higher saturation and high lightness for better readability with black text
 */
export function getCardColorFromIndex(index: number): string {
  const hue = getHueFromIndex(index)
  return `hsl(${hue}, 100%, 85%)`
}

/**
 * Gets the first letter of a name, capitalized
 */
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}
