export type Quadrant = 'high-imp-simple' | 'high-imp-complex' | 'low-imp-simple' | 'low-imp-complex'

export type Vote = {
  userId: string
  cardId: string
  x: number // percentLeft - for rendering position
  y: number // percentTop - for rendering position
  importance: number // derived from containmentPercentTop, 0-100 scale
  complexity: number // derived from containmentPercentLeft, 0-100 scale
  timestamp: number // for z-index calculation - latest on top
}

export type NextAction = 'do-now' | 'do-next' | 'postpone' | 'dont-do' | null

export type Card = {
  id: string
  text: string
  authorId: string
  createdAt: number
  votes: Vote[]
  nextAction?: NextAction
}

export type User = {
  id: string
  name: string
  avatar?: string
  color?: string
  cardColor?: string
  colorIndex: number
  ready?: boolean
  isAnonymous?: boolean
}

export type WorkshopStep = 'waiting' | 'input' | 'voting' | 'results'

export type Room = {
  id: string
  cards: Card[]
  users: User[]
  adminId: string
  step: WorkshopStep
  inputHeader?: string
  inputDescription?: string
  timerEndTime?: number
  timerDuration?: number
  workshopTitle?: string
  workshopDescription?: string
  anonymousVotes?: boolean
  anonymousCards?: boolean
}

export type AISummary = {
  keyInsights: string[]
  aiSuggestions: string[]
  wordCloud: Array<{ topic: string; weight: number }>
  generatedAt: number
}

export type RoomState = Room & {
  aiSummary?: AISummary
}

