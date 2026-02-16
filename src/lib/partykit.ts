import PartySocket from 'partysocket'
import type {
  RoomState,
  Card,
  Vote,
  User,
  WorkshopStep,
  NextAction,
} from '@/types/workshop'

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || 'localhost:1999'

export type RoomStateCallback = (state: RoomState | null) => void

export class RoomConnection {
  private socket: PartySocket | null = null
  private roomId: string
  private callbacks: Set<RoomStateCallback> = new Set()
  private state: RoomState | null = null

  constructor(roomId: string) {
    this.roomId = roomId
  }

  connect() {
    if (this.socket) return

    this.socket = new PartySocket({
      host: PARTYKIT_HOST,
      party: 'main',
      room: this.roomId,
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'state') {
          this.state = data.state || null
          this.notifyCallbacks()
        }
      } catch (error) {
        console.error('Failed to parse PartyKit message:', error)
      }
    })

    this.socket.addEventListener('open', () => {
      this.requestState()
    })

    this.socket.addEventListener('error', (error) => {
      console.error('PartyKit connection error:', error)
    })
  }

  private requestState() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'request-state' }))
    }
  }

  subscribe(callback: RoomStateCallback) {
    this.callbacks.add(callback)
    if (this.state) {
      callback(this.state)
    }
    return () => {
      this.callbacks.delete(callback)
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach((callback) => {
      callback(this.state)
    })
  }

  sendMessage(message: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    }
  }

  addUser(user: User) {
    this.sendMessage({
      type: 'add-user',
      user,
    })
  }

  addCard(card: Card) {
    this.sendMessage({
      type: 'add-card',
      card,
    })
  }

  addVote(vote: Vote) {
    this.sendMessage({
      type: 'add-vote',
      vote,
    })
  }

  setStep(step: WorkshopStep) {
    this.sendMessage({
      type: 'set-step',
      step,
    })
  }

  resetVotes() {
    this.sendMessage({
      type: 'reset-votes',
    })
  }

  setNextAction(cardId: string, nextAction: NextAction) {
    this.sendMessage({
      type: 'set-next-action',
      cardId,
      nextAction,
    })
  }

  generateAISummary() {
    this.sendMessage({
      type: 'generate-ai-summary',
    })
  }

  removeUser(userId: string) {
    this.sendMessage({
      type: 'remove-user',
      userId,
    })
  }

  updateUser(oldUserId: string, user: User) {
    this.sendMessage({
      type: 'update-user',
      oldUserId,
      user,
    })
  }

  deleteCard(cardId: string) {
    this.sendMessage({
      type: 'delete-card',
      cardId,
    })
  }

  updateInputText(inputHeader?: string, inputDescription?: string) {
    this.sendMessage({
      type: 'update-input-text',
      inputHeader,
      inputDescription,
    })
  }

  setTimer(durationMinutes: number) {
    this.sendMessage({
      type: 'set-timer',
      durationMinutes,
    })
  }

  clearTimer() {
    this.sendMessage({
      type: 'clear-timer',
    })
  }

  updateWorkshopInfo(info: {
    workshopTitle?: string
    workshopDescription?: string
    anonymousVotes?: boolean
    anonymousCards?: boolean
  }) {
    this.sendMessage({
      type: 'update-workshop-info',
      ...info,
    })
  }

  setReady(userId: string, ready: boolean) {
    this.sendMessage({
      type: 'set-ready',
      userId,
      ready,
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.callbacks.clear()
    this.state = null
  }

  getState(): RoomState | null {
    return this.state
  }

  isReady(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  waitForReady(): Promise<void> {
    if (this.isReady()) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.addEventListener('open', () => resolve(), { once: true })
      } else {
        resolve()
      }
    })
  }
}

const connections = new Map<string, RoomConnection>()

export function connectRoom(roomId: string): RoomConnection {
  let connection = connections.get(roomId)
  if (!connection) {
    connection = new RoomConnection(roomId)
    connections.set(roomId, connection)
    connection.connect()
  }
  return connection
}

export function disconnectRoom(roomId: string): void {
  const connection = connections.get(roomId)
  if (connection) {
    connection.disconnect()
    connections.delete(roomId)
  }
}
