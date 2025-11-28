import { nanoid } from 'nanoid'
import type { User } from '@/types/workshop'

const USER_KEY = 'workshop-user'
const ADMIN_ROOM_KEY = 'workshop-admin-room'

export function getUser(): User {
  if (typeof window === 'undefined') {
    const hue = (0 * 137.5077640500378) % 360
    return {
      id: '',
      name: 'Anonymous',
      colorIndex: 0,
      color: `hsl(${hue}, 80%, 45%)`,
      cardColor: `hsl(${hue}, 100%, 85%)`
    }
  }
  const stored = localStorage.getItem(USER_KEY)
  if (stored) {
    const user = JSON.parse(stored)
    // Add colorIndex if it doesn't exist (for backwards compatibility)
    if (user.colorIndex === undefined) {
      user.colorIndex = 0
    }
    // Always regenerate colors from colorIndex to ensure they use latest color scheme
    const hue = (user.colorIndex * 137.5077640500378) % 360
    user.color = `hsl(${hue}, 80%, 45%)`
    user.cardColor = `hsl(${hue}, 100%, 85%)`
    saveUser(user)
    return user
  }
  const name = prompt('Enter your name:') || 'Anonymous'
  const userId = nanoid()
  const colorIndex = 0
  const hue = (colorIndex * 137.5077640500378) % 360
  const color = `hsl(${hue}, 80%, 45%)` // Avatar color - darker, more saturated
  const cardColor = `hsl(${hue}, 100%, 85%)` // Card color - lighter, more pastel
  const user: User = {
    id: userId,
    name: name.trim() || 'Anonymous',
    colorIndex,
    color,
    cardColor,
  }
  saveUser(user)
  return user
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAdminRoomId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_ROOM_KEY)
}

export function setAdminRoomId(roomId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_ROOM_KEY, roomId)
}

export function clearAdminRoomId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_ROOM_KEY)
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ADMIN_ROOM_KEY)
}

