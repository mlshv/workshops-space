import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import type { Card, User, RoomState } from '@/types/workshop'
import type { RoomConnection } from '@/lib/partykit'
import {
  TrashIcon,
  TimerIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
} from '@phosphor-icons/react'
import { Button } from '../button'
import { Textarea } from '../textarea'
import { Checkbox } from '../checkbox'

type ProblemInputProps = {
  currentUser: User
  room: RoomState
  connection: RoomConnection
  isAdmin: boolean
  onSubmit: (card: Card) => void
  onSettingsClick?: () => void
}

export default function ProblemInput({
  currentUser,
  room,
  connection,
  isAdmin,
  onSubmit,
  onSettingsClick,
}: ProblemInputProps) {
  const [text, setText] = useState('')
  const [timerMinutes, setTimerMinutes] = useState<number>(5)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const displayTitle = room.workshopTitle || ''
  const displayDescription = room.workshopDescription || ''

  // Update countdown timer
  useEffect(() => {
    if (!room.timerEndTime) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const remaining = room.timerEndTime! - Date.now()
      if (remaining <= 0) {
        setTimeRemaining(0)
      } else {
        setTimeRemaining(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [room.timerEndTime])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    if (timerMinutes > 0) {
      connection.setTimer(timerMinutes)
    }
  }

  const handleStopTimer = () => {
    connection.clearTimer()
  }

  const handleSubmit = () => {
    if (text.trim()) {
      const card: Card = {
        id: nanoid(),
        text: text.trim(),
        authorId: currentUser.id,
        createdAt: Date.now(),
        votes: [],
      }
      onSubmit(card)
      setText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  const handleDelete = (cardId: string) => {
    if (confirm('Delete this card?')) {
      connection.deleteCard(cardId)
    }
  }

  // Filter to only show current user's cards, sorted by creation time (newest first)
  const sortedCards = [...room.cards]
    .filter((card) => card.authorId === currentUser.id)
    .sort((a, b) => b.createdAt - a.createdAt)

  const currentUserState = room.users.find((u) => u.id === currentUser.id)
  const isReady = currentUserState?.ready || false

  const handleReadyToggle = () => {
    connection.setReady(currentUser.id, !isReady)
  }

  return (
    <div className="flex">
      {/* Main input area */}
      <div className="flex-1 p-6 max-w-2xl mx-auto space-y-4">
        {/* Workshop Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <h2 className="text-4xl font-medium">{displayTitle}</h2>
            {isAdmin && onSettingsClick && (
              <button
                className="p-1 text-foreground/50 hover:text-foreground clickable"
                onClick={onSettingsClick}
              >
                <PencilIcon className="size-7" />
              </button>
            )}
          </div>
          <p className="text-xl">{displayDescription}</p>
        </div>

        {/* Timer Section */}
        <div className="h-16 flex flex-col justify-center border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TimerIcon size={20} />
              <span className="font-medium">Timer</span>
            </div>

            {timeRemaining !== null ? (
              <div className="flex items-center gap-3">
                <div
                  className={`text-2xl font-medium ${timeRemaining === 0 && 'text-red-500'}`}
                >
                  {formatTime(timeRemaining)}
                </div>
                {isAdmin && (
                  <Button
                    onClick={handleStopTimer}
                    className="flex items-center gap-1"
                  >
                    <StopIcon size={16} weight="fill" />
                    Stop
                  </Button>
                )}
              </div>
            ) : (
              <>
                {isAdmin ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Number(e.target.value))}
                      className="w-14 pl-4 pr-2 py-1 border border-border rounded text-center bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-foreground"
                    />
                    <span className="text-sm text-muted-foreground ml-1">
                      minutes
                    </span>
                    <Button
                      onClick={handleStartTimer}
                      className="flex items-center gap-1 ml-2"
                    >
                      <PlayIcon size={16} weight="fill" />
                      Start
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No timer set
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="problem-input" className="block pb-1 font-medium">
            Problem or idea
          </label>
          <Textarea
            id="problem-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your problem or idea... (Ctrl/Cmd + Enter to submit)"
            className="min-h-[8rem] resize-y"
          />
        </div>

        <div className="flex gap-3 items-center">
          <Button size="lg" onClick={handleSubmit} disabled={!text.trim()}>
            Add card
          </Button>

          <div
            className="flex items-center gap-2 cursor-pointer ml-auto"
            onClick={handleReadyToggle}
          >
            <Checkbox
              id="ready-checkbox"
              value={isReady}
              onChange={handleReadyToggle}
            />
            <label
              className="font-medium cursor-pointer select-none"
              htmlFor="ready-checkbox"
            >
              I'm finished
            </label>
          </div>
        </div>
      </div>

      {/* Cards sidebar */}
      <div className="w-80 border-l border-border p-4 overflow-y-auto">
        <h3 className="font-medium mb-3">Your cards ({sortedCards.length})</h3>
        <div className="space-y-2">
          {sortedCards.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No cards yet</p>
          ) : (
            sortedCards.map((card) => (
              <div key={card.id} className="p-3 pr-2 border border-border">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm flex-1 text-ellipsis overflow-hidden whitespace-nowrap">{card.text}</p>
                  <button
                    onClick={() => handleDelete(card.id)}
                    title="Delete card"
                    className="p-1 text-foreground/50 hover:text-foreground clickable"
                  >
                    <TrashIcon size={18} weight="bold" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
