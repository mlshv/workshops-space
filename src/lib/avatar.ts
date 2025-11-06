/**
 * Generates a deterministic HSL color from a string (name)
 * Uses a simple hash function to map names to hue values (0-360)
 */
export function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Map hash to hue (0-360)
  const hue = Math.abs(hash % 360)

  // Use fixed saturation and lightness for consistent, vibrant colors
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Gets the first letter of a name, capitalized
 */
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}
