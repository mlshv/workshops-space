import type * as Party from 'partykit/server'
import { generateObject } from 'ai'
import { z } from 'zod'
import { cerebras } from '@ai-sdk/cerebras'

type Message =
  | { type: 'init-room'; state: RoomState }
  | { type: 'request-state' }
  | { type: 'add-user'; user: User }
  | { type: 'add-card'; card: Card }
  | { type: 'add-vote'; vote: Vote }
  | { type: 'set-step'; step: WorkshopStep }
  | { type: 'reset-votes' }
  | { type: 'set-next-action'; cardId: string; nextAction: NextAction }
  | { type: 'generate-ai-summary' }
  | { type: 'remove-user'; userId: string }
  | { type: 'delete-card'; cardId: string }
  | { type: 'update-input-text'; inputHeader?: string; inputDescription?: string }
  | { type: 'set-timer'; durationMinutes: number }
  | { type: 'clear-timer' }
  | { type: 'update-workshop-info'; workshopTitle?: string; workshopDescription?: string; anonymousVotes?: boolean; anonymousCards?: boolean }
  | { type: 'set-ready'; userId: string; ready: boolean }

type User = {
  id: string
  name: string
  avatar?: string
  color?: string
  cardColor?: string
  colorIndex: number
  ready?: boolean
}

type Vote = {
  userId: string
  cardId: string
  x: number
  y: number
  importance: number
  complexity: number
  timestamp: number
}

type NextAction = 'do-now' | 'do-next' | 'postpone' | 'dont-do' | null

type Card = {
  id: string
  text: string
  authorId: string
  createdAt: number
  votes: Vote[]
  nextAction?: NextAction
}

type WorkshopStep = 'waiting' | 'input' | 'voting' | 'results'

type AISummary = {
  keyInsights: string[]
  aiSuggestions: string[]
  wordCloud: Array<{ topic: string; weight: number }>
  generatedAt: number
}

type RoomState = {
  id: string
  cards: Card[]
  users: User[]
  adminId: string
  step: WorkshopStep
  aiSummary?: AISummary
  inputHeader?: string
  inputDescription?: string
  timerEndTime?: number
  timerDuration?: number
  workshopTitle?: string
  workshopDescription?: string
  anonymousVotes?: boolean
  anonymousCards?: boolean
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    const state = (await this.room.storage.get<RoomState>('state')) || null

    if (state) {
      conn.send(JSON.stringify({ type: 'state', state }))
    } else {
      conn.send(JSON.stringify({ type: 'state', state: null }))
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as Message
      let state = (await this.room.storage.get<RoomState>('state')) || null

      switch (data.type) {
        case 'init-room': {
          if (!state) {
            state = {
              ...data.state,
              workshopTitle: `Session ${data.state.id}`,
              workshopDescription: "Welcome to the brainstorming session! Let's collaborate on identifying and prioritizing problems and ideas.",
            }
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'request-state': {
          if (state) {
            sender.send(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'add-user': {
          if (!state) break

          const userExists = state.users.some((u) => u.id === data.user.id)
          if (!userExists) {
            // Assign sequential colorIndex based on existing users
            const maxColorIndex = state.users.length > 0
              ? Math.max(...state.users.map((u) => u.colorIndex ?? -1))
              : -1
            const colorIndex = maxColorIndex + 1

            // Generate colors from colorIndex using Golden Angle
            const hue = (colorIndex * 137.5077640500378) % 360
            const color = `hsl(${hue}, 80%, 45%)` // Avatar color - darker, more saturated
            const cardColor = `hsl(${hue}, 100%, 85%)` // Card color - lighter, more pastel

            const newUser = {
              ...data.user,
              colorIndex,
              color,
              cardColor,
            }
            state.users.push(newUser)
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'add-card': {
          if (!state) break

          const cardExists = state.cards.some((c) => c.id === data.card.id)
          if (!cardExists) {
            state.cards.push(data.card)
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'add-vote': {
          if (!state) break

          const card = state.cards.find((c) => c.id === data.vote.cardId)
          if (card) {
            const existingVoteIndex = card.votes.findIndex(
              (v) =>
                v.userId === data.vote.userId && v.cardId === data.vote.cardId,
            )
            if (existingVoteIndex >= 0) {
              card.votes[existingVoteIndex] = data.vote
            } else {
              card.votes.push(data.vote)
            }
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'set-step': {
          if (!state) break

          state.step = data.step

          // Reset all users' ready state when changing steps
          state.users.forEach((user) => {
            user.ready = false
          })

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'reset-votes': {
          if (!state) break

          state.cards.forEach((card) => {
            card.votes = []
          })
          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'set-next-action': {
          if (!state) break

          const card = state.cards.find((c) => c.id === data.cardId)
          if (card) {
            card.nextAction = data.nextAction
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }

        case 'generate-ai-summary': {
          if (!state) break

          try {
            const summary = await this.generateAISummary(state)
            state.aiSummary = summary
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          } catch (error) {
            console.error('Error generating AI summary:', error)
            sender.send(
              JSON.stringify({
                type: 'error',
                message: 'Failed to generate AI summary',
              }),
            )
          }
          break
        }

        case 'remove-user': {
          if (!state) break

          // Remove user from users array
          state.users = state.users.filter((u) => u.id !== data.userId)

          // Remove all cards authored by this user
          state.cards = state.cards.filter((c) => c.authorId !== data.userId)

          // Remove all votes by this user from remaining cards
          state.cards.forEach((card) => {
            card.votes = card.votes.filter((v) => v.userId !== data.userId)
          })

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'delete-card': {
          if (!state) break

          // Remove the card and all its votes
          state.cards = state.cards.filter((c) => c.id !== data.cardId)

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'update-input-text': {
          if (!state) break

          if (data.inputHeader !== undefined) {
            state.inputHeader = data.inputHeader
          }
          if (data.inputDescription !== undefined) {
            state.inputDescription = data.inputDescription
          }

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'set-timer': {
          if (!state) break

          const durationMs = data.durationMinutes * 60 * 1000
          state.timerEndTime = Date.now() + durationMs
          state.timerDuration = data.durationMinutes

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'clear-timer': {
          if (!state) break

          state.timerEndTime = undefined
          state.timerDuration = undefined

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'update-workshop-info': {
          if (!state) break

          if (data.workshopTitle !== undefined) {
            state.workshopTitle = data.workshopTitle
          }
          if (data.workshopDescription !== undefined) {
            state.workshopDescription = data.workshopDescription
          }
          if (data.anonymousVotes !== undefined) {
            state.anonymousVotes = data.anonymousVotes
          }
          if (data.anonymousCards !== undefined) {
            state.anonymousCards = data.anonymousCards
          }

          await this.room.storage.put('state', state)
          this.room.broadcast(JSON.stringify({ type: 'state', state }))
          break
        }

        case 'set-ready': {
          if (!state) break

          const user = state.users.find((u) => u.id === data.userId)
          if (user) {
            user.ready = data.ready
            await this.room.storage.put('state', state)
            this.room.broadcast(JSON.stringify({ type: 'state', state }))
          }
          break
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }

  private async generateAISummary(state: RoomState): Promise<AISummary> {
    // Prepare data for AI
    const cardsDataForLLM = state.cards.map((card) => {
      const voteCount = card.votes.length
      const avgImportance =
        voteCount > 0
          ? card.votes.reduce((sum, v) => sum + v.importance, 0) / voteCount
          : 0
      const avgComplexity =
        voteCount > 0
          ? card.votes.reduce((sum, v) => sum + v.complexity, 0) / voteCount
          : 0

      return {
        text: card.text,
        votes: card.votes.map((vote) => ({
          user: {
            id: vote.userId,
            name:
              state.users.find((u) => u.id === vote.userId)?.name || 'Unknown',
          },
          importance: vote.importance,
          complexity: vote.complexity,
        })),
        avgImportance: avgImportance.toFixed(1),
        avgComplexity: avgComplexity.toFixed(1),
      }
    })

    const prompt = `You are analyzing results from a collaborative workshop where teams voted on problems/ideas using a 2D matrix (Importance vs Complexity).

Workshop Data:
${JSON.stringify(cardsDataForLLM, null, 2)}

Please analyze this data and provide:
1. Key Insights: EXACTLY 3 important observations about the voting patterns, priorities, and team alignment
   - Each insight should be approximately 7 words (never more than 10 words)
   - Be concise and direct
2. AI Suggestions: EXACTLY 3 actionable recommendations for the team based on the results
   - Each suggestion should be approximately 7 words (never more than 10 words)
   - Be concise and direct
3. Word Cloud: Extract 5-10 key topics/themes mentioned across all cards with their significance weight (1-10)

IMPORTANT:
- Detect the language used in the ideas/problems (cards text).
- Generate all insights, suggestions, and word cloud topics IN THE SAME LANGUAGE as the input content.
- Use simple, clear language (B1 level). Avoid complex words and jargon.

CRITICAL:
- You MUST provide exactly 3 items for keyInsights and aiSuggestions
- Each bullet point must be SHORT - aim for 7 words, maximum 10 words
- For wordCloud, provide 5-10 topics`

    const { object } = await generateObject({
      model: cerebras('gpt-oss-120b'),
      schema: z.object({
        keyInsights: z
          .array(z.string())
          .length(3)
          .describe(
            '3 key insights about voting patterns and priorities, each 7-10 words',
          ),
        aiSuggestions: z
          .array(z.string())
          .length(3)
          .describe('3 actionable recommendations, each 7-10 words'),
        wordCloud: z
          .array(
            z.object({
              topic: z.string().describe('Topic name (1-3 words)'),
              weight: z
                .number()
                .min(1)
                .max(10)
                .describe('Significance weight (1-10)'),
            }),
          )
          .min(5)
          .max(10)
          .describe('5-10 key topics/themes'),
      }),
      prompt,
      temperature: 0.7,
    })

    return {
      keyInsights: object.keyInsights,
      aiSuggestions: object.aiSuggestions,
      wordCloud: object.wordCloud,
      generatedAt: Date.now(),
    }
  }
}
