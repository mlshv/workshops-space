import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { connectRoom, disconnectRoom } from '@/lib/partykit'
import { getUser, getAdminRoomId, logout } from '@/lib/user'
import type {
  RoomState,
  Card,
  Vote,
  WorkshopStep,
  User,
} from '@/types/workshop'
import WaitingRoom from '@/components/workshop/WaitingRoom'
import ProblemInput from '@/components/workshop/ProblemInput'
import ResultsMatrix from '@/components/workshop/ResultsMatrix'
import VotingMatrix2 from '@/components/workshop/VotingMatrix2'
import { ParticipantsSidebar } from '@/components/workshop/ParticipantsSidebar'

export const Route = createFileRoute('/workshop/$roomId')({
  component: WorkshopPage,
})

function WorkshopPage() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [connection, setConnection] = useState<ReturnType<
    typeof connectRoom
  > | null>(null)

  useEffect(() => {
    const user = getUser()
    const admin = getAdminRoomId() === roomId
    setCurrentUser(user)
    setIsAdmin(admin)

    const conn = connectRoom(roomId)
    setConnection(conn)

    const unsubscribe = conn.subscribe((state) => {
      if (state) {
        setRoomState(state)
        if (!state.users.some((u) => u.id === user.id)) {
          conn.addUser(user)
        }
      } else if (state === null) {
        const initialState: RoomState = {
          id: roomId,
          cards: [],
          users: [user],
          adminId: admin ? user.id : '',
          step: 'waiting',
        }
        conn.sendMessage({
          type: 'init-room',
          state: initialState,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [roomId])

  if (!roomState || !connection || !currentUser) {
    return (
      <div className="p-6">
        <p>Connecting to room...</p>
      </div>
    )
  }

  const handleCardSubmit = (card: Card) => {
    connection.addCard(card)
  }

  const handleVote = (vote: Vote) => {
    connection.addVote(vote)
  }

  const getNextStep = (currentStep: WorkshopStep): WorkshopStep | null => {
    const steps: WorkshopStep[] = ['waiting', 'input', 'voting', 'results']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
  }

  const getPreviousStep = (currentStep: WorkshopStep): WorkshopStep | null => {
    const steps: WorkshopStep[] = ['waiting', 'input', 'voting', 'results']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex > 0 ? steps[currentIndex - 1] : null
  }

  const handleNextStep = () => {
    const nextStep = getNextStep(roomState.step)
    if (nextStep) {
      connection.setStep(nextStep)
    }
  }

  const handlePreviousStep = () => {
    const prevStep = getPreviousStep(roomState.step)
    if (prevStep) {
      connection.setStep(prevStep)
    }
  }

  const handleResetVotes = () => {
    if (confirm('Are you sure you want to reset all votes?')) {
      connection.resetVotes()
    }
  }

  const handleLogout = () => {
    disconnectRoom(roomId)
    logout()
    navigate({ to: '/' })
  }

  const renderStep = () => {
    switch (roomState.step) {
      case 'waiting':
        return <WaitingRoom room={roomState} currentUser={currentUser} />
      case 'input':
        return (
          <ProblemInput currentUser={currentUser} onSubmit={handleCardSubmit} />
        )
      case 'voting':
        return (
          <VotingMatrix2
            room={roomState}
            currentUser={currentUser}
            onVote={handleVote}
          />
        )
      case 'results':
        return <ResultsMatrix room={roomState} connection={connection} isAdmin={isAdmin} />
      default:
        return <div>Unknown step: {roomState.step}</div>
    }
  }

  const nextStep = getNextStep(roomState.step)
  const prevStep = getPreviousStep(roomState.step)

  return (
    <div className="h-screen flex">
      <ParticipantsSidebar
        users={roomState.users}
        currentUserId={currentUser.id}
        cards={roomState.cards}
        showVoteProgress={roomState.step === 'voting'}
        isAdmin={isAdmin}
        connection={connection}
      />
      <div className="w-full h-full">
        <header className="h-[4rem] border-b px-4 py-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold">room {roomId}</h1>
              <p className="text-sm text-gray-600">
                {currentUser.name}
                {isAdmin && ' (Admin)'}
                {' · '}
                <button
                  onClick={handleLogout}
                  className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
                >
                  logout
                </button>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                stage: <strong>{roomState.step}</strong>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  {prevStep && (
                    <button
                      onClick={handlePreviousStep}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      Previous
                    </button>
                  )}
                  {nextStep && (
                    <button
                      onClick={handleNextStep}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Next
                    </button>
                  )}
                  <button
                    onClick={handleResetVotes}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Reset votes
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-4rem)]">{renderStep()}</div>
      </div>
    </div>
  )
}
