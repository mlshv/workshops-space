import { useState } from 'react'
import { nanoid } from 'nanoid'
import type { Card, User } from '@/types/workshop'

type ProblemInputProps = {
  currentUser: User
  onSubmit: (card: Card) => void
}

export default function ProblemInput({
  currentUser,
  onSubmit,
}: ProblemInputProps) {
  const [text, setText] = useState('')

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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Add Problems & Ideas</h2>
      <p className="text-gray-600">
        Add as many problems or ideas as you'd like. You'll vote on them in the next step.
      </p>

      <div>
        <label className="block mb-2 font-semibold">Problem or Idea</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your problem or idea... (Ctrl/Cmd + Enter to submit)"
          className="w-full px-3 py-2 border rounded min-h-[120px] resize-y"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Add Card
      </button>
    </div>
  )
}
