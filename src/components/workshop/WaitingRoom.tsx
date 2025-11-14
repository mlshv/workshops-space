import { useState } from 'react'
import type { RoomState, User } from '@/types/workshop'
import type { RoomConnection } from '@/lib/partykit'
import { CheckIcon, CopyIcon, PencilIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { UserAvatar } from './UserAvatar'

type WaitingRoomProps = {
  room: RoomState
  currentUser: User
  connection: RoomConnection
  isAdmin: boolean
  onSettingsClick?: () => void
}

export default function WaitingRoom({
  room,
  currentUser,
  connection,
  isAdmin,
  onSettingsClick,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)
  const displayTitle = room.workshopTitle || ''
  const displayDescription = room.workshopDescription || ''

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
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

      <div className="">
        <h2 className="text-4xl font-medium mb-4">Invite link</h2>
        <div className="flex flex-col items-start gap-1 mt-2">
          <button
            className="inline-flex items-center gap-2 cursor-pointer border border-border rounded pl-4 pr-3 py-2 text-xl hover:bg-foreground/5"
            onClick={handleCopy}
            title="Copy link"
          >
            {shareUrl}{' '}
            <div className="relative inline-flex items-center">
              <AnimatePresence initial={false}>
                {copied ? (
                  <motion.div
                    key="checkmark"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, position: 'absolute' }}
                    className="inline-flex"
                  >
                    <CheckIcon className="size-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    className="inline-flex"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, position: 'absolute' }}
                  >
                    <CopyIcon className="size-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-medium text-4xl mb-4">
          Participants ({room.users.length})
        </h2>
        <ul className="space-y-2">
          {room.users.map((user) => (
            <li key={user.id} className="flex items-center gap-2">
              <UserAvatar name={user.name} />
              <div>
                <span className="font-medium">{user.name}</span>
                {user.id === room.adminId && (
                  <span className="text-muted-foreground text-xs ml-2">
                    (creator)
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
