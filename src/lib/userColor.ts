// Generate a consistent color for a user based on their ID
export function getUserColor(userId: string): string {
  const colors = [
    '#FEF3C7', // yellow-100
    '#FED7AA', // orange-200
    '#FECACA', // red-200
    '#FBCFE8', // pink-200
    '#DDD6FE', // purple-200
    '#C7D2FE', // indigo-200
    '#BFDBFE', // blue-200
    '#BAE6FD', // sky-200
    '#A5F3FC', // cyan-200
    '#99F6E4', // teal-200
    '#A7F3D0', // emerald-200
    '#BBF7D0', // green-200
  ]

  // Simple hash function
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
