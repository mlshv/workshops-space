/**
 * Generates a deterministic hue value (0-360) from a string (name)
 * Uses a simple hash function to ensure same name always gets same hue
 */
function getHueFromName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash % 360)
}

/**
 * Generates a vibrant HSL color for avatars from a name
 * Uses higher saturation and medium lightness for visibility
 */
export function getColorFromName(name: string): string {
  const hue = getHueFromName(name)
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Generates a light HSL color for card backgrounds from a name
 * Uses lower saturation and high lightness for better readability with black text
 */
export function getCardColorFromName(name: string): string {
  const hue = getHueFromName(name)
  return `hsl(${hue}, 100%, 85%)`
}

/**
 * Gets the first letter of a name, capitalized
 */
export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}
