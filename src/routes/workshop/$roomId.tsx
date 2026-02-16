import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { connectRoom, disconnectRoom } from '@/lib/partykit'
import { getAdminRoomId, getLegacyUser, clearLegacyUser, logout } from '@/lib/user'
import { useAuth } from '@/hooks/useAuth'
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
import VotingMatrix from '@/components/workshop/VotingMatrix'
import { Sidebar } from '@/components/workshop/Sidebar'
import { StagesProgress } from '@/components/workshop/StagesProgress'
import { SettingsModal } from '@/components/workshop/SettingsModal'
import { SmallAppleSpinner } from '@/components/small-apple-spinner'

export const Route = createFileRoute('/workshop/$roomId')({
  component: WorkshopPage,
})

function WorkshopPage() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const { user: authUser, isPending: authPending, session, signInAnonymous } = useAuth()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [connection, setConnection] = useState<ReturnType<
    typeof connectRoom
  > | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Track previous user ID for identity migration
  const previousUserIdRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)
  const legacyUserRef = useRef<User | null>(null)

  // On mount, check for legacy localStorage user before auth kicks in
  useEffect(() => {
    const legacy = getLegacyUser()
    if (legacy) {
      legacyUserRef.current = legacy
    }
  }, [])

  // Auto-create anonymous session if no session exists
  useEffect(() => {
    if (!authPending && !session && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      signInAnonymous()
    }
  }, [authPending, session, signInAnonymous])

  // Main effect: connect to room when auth user is available
  useEffect(() => {
    if (!authUser) return

    const admin = getAdminRoomId() === roomId
    setCurrentUser(authUser)
    setIsAdmin(admin)

    const conn = connectRoom(roomId)
    setConnection(conn)

    const legacyUser = legacyUserRef.current

    const unsubscribe = conn.subscribe((state) => {
      if (state) {
        setRoomState(state)

        // Check if legacy user needs migration
        if (legacyUser) {
          const legacyInRoom = state.users.some((u) => u.id === legacyUser.id) ||
            state.cards.some((c) => c.authorId === legacyUser.id) ||
            state.adminId === legacyUser.id

          if (legacyInRoom && legacyUser.id !== authUser.id) {
            // Migrate legacy identity to new auth identity
            conn.updateUser(legacyUser.id, authUser)
            if (state.adminId === legacyUser.id) {
              setIsAdmin(true)
            }
          } else if (!state.users.some((u) => u.id === authUser.id)) {
            // Legacy user not in room, just add as new user
            conn.addUser(authUser)
          }
          // Clear legacy user after handling
          clearLegacyUser()
          legacyUserRef.current = null
        } else if (!state.users.some((u) => u.id === authUser.id)) {
          conn.addUser(authUser)
        }
      } else if (state === null) {
        const initialState: RoomState = {
          id: roomId,
          cards: [],
          users: [authUser],
          adminId: admin ? authUser.id : '',
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
  }, [roomId, authUser])

  // Handle identity transition when user signs in with Google mid-session
  useEffect(() => {
    if (!authUser || !connection || !roomState) return

    const prevId = previousUserIdRef.current
    if (prevId && prevId !== authUser.id) {
      // User identity changed (e.g., anonymous -> Google)
      const prevInRoom = roomState.users.some((u) => u.id === prevId) ||
        roomState.cards.some((c) => c.authorId === prevId) ||
        roomState.adminId === prevId

      if (prevInRoom) {
        connection.updateUser(prevId, authUser)
        if (roomState.adminId === prevId) {
          setIsAdmin(true)
        }
      }
    }
    previousUserIdRef.current = authUser.id
    setCurrentUser(authUser)
  }, [authUser, connection, roomState])

  if (authPending || !roomState || !connection || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-screen p-6">
        <SmallAppleSpinner className="size-6 text-foreground/50" />
        <p className="text-sm text-muted-foreground">Connecting to session...</p>
      </div>
    )
  }

  const handleCardSubmit = (card: Card) => {
    connection.addCard(card)
  }

  const handleVote = (vote: Vote) => {
    connection.addVote(vote)
  }

  const handleLogout = () => {
    disconnectRoom(roomId)
    logout()
    navigate({ to: '/' })
  }

  const handleStepClick = (step: WorkshopStep) => {
    if (isAdmin) {
      connection.setStep(step)
    }
  }

  const renderStep = () => {
    switch (roomState.step) {
      case 'waiting':
        return (
          <WaitingRoom
            room={roomState}
            currentUser={currentUser}
            connection={connection}
            isAdmin={isAdmin}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        )
      case 'input':
        return (
          <ProblemInput
            currentUser={currentUser}
            room={roomState}
            connection={connection}
            isAdmin={isAdmin}
            onSubmit={handleCardSubmit}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        )
      case 'voting':
        return (
          <VotingMatrix
            room={roomState}
            currentUser={currentUser}
            onVote={handleVote}
          />
        )
      case 'results':
        return (
          <ResultsMatrix
            room={roomState}
            connection={connection}
            isAdmin={isAdmin}
          />
        )
      default:
        return <div>Unknown step: {roomState.step}</div>
    }
  }

  return (
    <div className="h-screen flex">
      <Sidebar
        users={roomState.users}
        currentUserId={currentUser.id}
        cards={roomState.cards}
        showVoteProgress={roomState.step === 'voting'}
        showReadyStatus={roomState.step === 'input'}
        currentStep={roomState.step}
        isAdmin={isAdmin}
        connection={connection}
        onLogout={handleLogout}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <div className="w-full h-full">
        <header className="h-[3rem] flex flex-col justify-center border-b px-4 py-2 ">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-medium">
              {roomState.workshopTitle?.trim() || `Session ${roomState.id}`}
            </h1>

            <StagesProgress
              currentStep={roomState.step}
              isAdmin={isAdmin}
              onStepClick={handleStepClick}
            />
          </div>
        </header>
        <div className="h-[calc(100vh-3rem)] overflow-y-auto">
          {renderStep()}
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        room={roomState}
        connection={connection}
        isAdmin={isAdmin}
      />
    </div>
  )
}
