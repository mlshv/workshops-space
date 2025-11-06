import type { RoomState, User } from '@/types/workshop'

type WaitingRoomProps = {
  room: RoomState
  currentUser: User
}

export default function WaitingRoom({
  room,
  currentUser,
}: WaitingRoomProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Waiting for everyone to join</h2>
        <p className="text-gray-600">Share this link with participants:</p>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Participants ({room.users.length}):</h3>
        <ul className="space-y-1">
          {room.users.map((user) => (
            <li key={user.id} className="text-sm">
              {user.name}
              {user.id === room.adminId && ' (Admin)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

