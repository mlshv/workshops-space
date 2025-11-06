import { nanoid } from 'nanoid'
import type { User } from '@/types/workshop'

const USER_KEY = 'workshop-user'
const ADMIN_ROOM_KEY = 'workshop-admin-room'

export function getUser(): User {
  if (typeof window === 'undefined') {
    return { id: '', name: 'Anonymous' }
  }
  const stored = localStorage.getItem(USER_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  const name = prompt('Enter your name:') || 'Anonymous'
  const user: User = {
    id: nanoid(),
    name: name.trim() || 'Anonymous',
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

