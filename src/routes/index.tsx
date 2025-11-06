import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { setAdminRoomId } from '@/lib/user'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  const handleJoin = () => {
    if (roomCode.trim()) {
      navigate({ to: '/workshop/$roomId', params: { roomId: roomCode.trim() } })
    }
  }

  const handleCreate = () => {
    const newRoomId = nanoid(6)
    setAdminRoomId(newRoomId)
    navigate({ to: '/workshop/$roomId', params: { roomId: newRoomId } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Workshop</h1>

        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="mb-2 font-semibold">Join a room</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="flex-1 px-3 py-2 border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoin()
                  }
                }}
              />
              <button
                onClick={handleJoin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Join
              </button>
            </div>
          </div>

          <div className="border p-4 rounded">
            <h2 className="mb-2 font-semibold">Create a room</h2>
            <button
              onClick={handleCreate}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
