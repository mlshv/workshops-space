import type { User, Card } from '@/types/workshop'
import { Popover } from '@base-ui-components/react/popover'
import { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import type { RoomConnection } from '@/lib/partykit'
import { Button } from '../button'
import { GearIcon } from '@phosphor-icons/react'

type SidebarProps = {
  users: User[]
  currentUserId: string
  cards: Card[]
  showVoteProgress?: boolean
  isAdmin?: boolean
  connection?: RoomConnection
  onLogout?: () => void
  onSettingsClick?: () => void
}

export function Sidebar({
  users,
  currentUserId,
  cards,
  showVoteProgress = false,
  isAdmin = false,
  connection,
  onLogout,
  onSettingsClick,
}: SidebarProps) {
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
    <aside className="h-full border-r border-gray-200 py-2 flex flex-col items-center">
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
              <div className="relative py-1 px-2">
                <UserAvatar name={user.name} size="base" />
                {showVoteProgress && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-gray-800 text-white text-xxs px-1.5 py-0.5 rounded-full font-semibold shadow-md">
                    {stats.votedCards}/{stats.totalCards}
                  </div>
                )}
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner
                sideOffset={-4}
                side="right"
                align="start"
                className="z-[300]"
              >
                <Popover.Popup className="flex flex-col gap-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded shadow-lg">
                  <div className="font-semibold">
                    {user.name}
                    {user.id === currentUserId && ' (you)'}
                  </div>
                  <div className="text-xs">
                    <div>
                      Added: {stats.addedCards} card
                      {stats.addedCards !== 1 ? 's' : ''}
                    </div>
                    <div>
                      Voted: {stats.votedCards}/{stats.totalCards}
                    </div>
                  </div>
                  {user.id === currentUserId && onLogout && (
                    <Button variant="inverse" onClick={onLogout}>
                      Logout
                    </Button>
                  )}
                  {isAdmin && user.id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveUser(user.id, user.name)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors cursor-pointer"
                    >
                      Kick
                    </button>
                  )}
                  <Popover.Arrow className="fill-popover" />
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )
      })}

      {isAdmin && (
        <button
          className="mt-auto p-2 text-foreground/50 hover:text-foreground clickable"
          onClick={onSettingsClick}
        >
          <GearIcon className="size-7" weight="fill" />
        </button>
      )}
    </aside>
  )
}
