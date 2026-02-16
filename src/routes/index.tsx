import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { setAdminRoomId } from '@/lib/user'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { PlusIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { SignInButton } from '@/components/auth/SignInButton'
import { UserMenu } from '@/components/auth/UserMenu'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const { isPending, isAuthenticated } = useAuth()

  const handleJoin = () => {
    if (roomCode.trim()) {
      if (roomCode.includes('https://')) {
        const url = new URL(roomCode.trim())
        const roomId = url.pathname.split('/').pop()

        if (roomId) {
          navigate({ to: '/workshop/$roomId', params: { roomId } })
        }
      } else {
        navigate({
          to: '/workshop/$roomId',
          params: { roomId: roomCode.trim() },
        })
      }
    }
  }

  const handleCreate = () => {
    const newRoomId = nanoid(6)
    setAdminRoomId(newRoomId)
    navigate({ to: '/workshop/$roomId', params: { roomId: newRoomId } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        {isPending ? null : isAuthenticated ? (
          <UserMenu />
        ) : (
          <SignInButton />
        )}
      </div>

      <div className="max-w-md w-full space-y-6">
        {/* <h1 className="text-4xl text-center">Workshop</h1> */}

        <div className="space-y-4">
          <Button
            size="lg"
            onClick={handleCreate}
            className="flex w-full gap-2 items-center justify-center py-2"
          >
            {' '}
            <PlusIcon className="size-5" /> Create a session
          </Button>

          <div className="text-center text-muted-foreground text-sm">or</div>

          <div className="border p-4 rounded shadow-sm">
            <h2 className="mb-2 font-medium">Join a session</h2>
            <div className="flex gap-2">
              <Input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter session code or URL"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoin()
                  }
                }}
              />
              <Button onClick={handleJoin}>Join</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
