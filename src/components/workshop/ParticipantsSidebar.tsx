import type { User, Card } from '@/types/workshop'
import { Popover } from '@base-ui-components/react/popover'
import { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import type { RoomConnection } from '@/lib/partykit'
import { XIcon } from '@phosphor-icons/react'

type ParticipantsSidebarProps = {
  users: User[]
  currentUserId: string
  cards: Card[]
  showVoteProgress?: boolean
  isAdmin?: boolean
  connection?: RoomConnection
}

export function ParticipantsSidebar({
  users,
  currentUserId,
  cards,
  showVoteProgress = false,
  isAdmin = false,
  connection,
}: ParticipantsSidebarProps) {
  const [tooltipUserId, setTooltipUserId] = useState<string | null>(null)

  // Calculate stats for each user
  const getUserStats = (userId: string) => {
    const addedCards = cards.filter((card) => card.authorId === userId).length
    const votedCards = cards.filter((card) =>
      card.votes.some((vote) => vote.userId === userId),
    ).length
    const totalCards = cards.length

    return { addedCards, votedCards, totalCards }
  }

  const handleRemoveUser = (userId: string, userName: string) => {
    if (!connection) return

    if (
      confirm(
        `Remove ${userName} from the room? This will delete all their cards and votes.`,
      )
    ) {
      connection.removeUser(userId)
      setTooltipUserId(null) // Close the popover
    }
  }

  return (
    <aside className="h-full overflow-y-auto bg-gray-50 border-r border-gray-200 py-3 px-2 flex flex-col items-center gap-2">
      {users.map((user) => {
        const stats = getUserStats(user.id)

        return (
          <Popover.Root
            key={user.id}
            delay={0}
            openOnHover={true}
            open={tooltipUserId === user.id}
            onOpenChange={(open) => setTooltipUserId(open ? user.id : null)}
          >
            <Popover.Trigger className="cursor-default">
              <div className="relative">
                <UserAvatar name={user.name} size="base" />
                {showVoteProgress && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-gray-800 text-white text-xxs px-1.5 py-0.5 rounded-full font-semibold shadow-md">
                    {stats.votedCards}/{stats.totalCards}
                  </div>
                )}
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner sideOffset={8} side="right" className="z-[300]">
                <Popover.Popup className="px-3 py-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                  <div className="font-semibold mb-1">
                    {user.name}
                    {user.id === currentUserId && ' (you)'}
                  </div>
                  <div className="text-xs text-gray-300">
                    Added: {stats.addedCards} card
                    {stats.addedCards !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-300">
                    Voted: {stats.votedCards}/{stats.totalCards}
                  </div>
                  {isAdmin && user.id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveUser(user.id, user.name)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors cursor-pointer"
                    >
                      Kick
                    </button>
                  )}
                  <Popover.Arrow className="fill-gray-800" />
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )
      })}
    </aside>
  )
}
