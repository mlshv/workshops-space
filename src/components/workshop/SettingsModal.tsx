import { Dialog } from '@base-ui-components/react/dialog'
import { XIcon } from '@phosphor-icons/react'
import type { RoomState } from '@/types/workshop'
import type { RoomConnection } from '@/lib/partykit'
import { SettingsForm } from './SettingsForm'
import { Button } from '../button'
import { useState, useEffect } from 'react'

type SettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: RoomState
  connection: RoomConnection
  isAdmin: boolean
}

export function SettingsModal({
  open,
  onOpenChange,
  room,
  connection,
  isAdmin,
}: SettingsModalProps) {
  // Local state for form values to avoid network lag
  const [localTitle, setLocalTitle] = useState(room.workshopTitle || '')
  const [localDescription, setLocalDescription] = useState(room.workshopDescription || '')

  // Initialize local state when modal opens or room values change
  useEffect(() => {
    if (open) {
      setLocalTitle(room.workshopTitle || '')
      setLocalDescription(room.workshopDescription || '')
    }
  }, [open, room.workshopTitle, room.workshopDescription])

  const handleTitleChange = (title: string) => {
    setLocalTitle(title)
  }

  const handleDescriptionChange = (description: string) => {
    setLocalDescription(description)
  }

  const handleTitleBlur = () => {
    // Only sync if value changed
    if (localTitle !== (room.workshopTitle || '')) {
      connection.updateWorkshopInfo({ workshopTitle: localTitle })
    }
  }

  const handleDescriptionBlur = () => {
    // Only sync if value changed
    if (localDescription !== (room.workshopDescription || '')) {
      connection.updateWorkshopInfo({ workshopDescription: localDescription })
    }
  }

  const handleAnonymousVotesChange = (anonymousVotes: boolean) => {
    // Keep checkbox syncing immediately since it's a single toggle
    connection.updateWorkshopInfo({ anonymousVotes })
  }

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Save any pending changes when modal closes
      handleTitleBlur()
      handleDescriptionBlur()
    }
    onOpenChange(isOpen)
  }

  const handleResetVotes = () => {
    if (confirm('Are you sure you want to reset all votes?')) {
      connection.resetVotes()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-[400] backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[500] w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Close className="absolute top-6.5 right-4 hover:scale-110 active:scale-95 transition-scale duration-100 cursor-pointer">
            <XIcon className="w-5.5 h-5.5" />
          </Dialog.Close>
          <div className="p-6 space-y-6">
            <Dialog.Title className="text-4xl font-medium">
              Session settings
            </Dialog.Title>

            <div className="space-y-6">
              <SettingsForm
                title={localTitle}
                description={localDescription}
                anonymousVotes={room.anonymousVotes || false}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onAnonymousVotesChange={handleAnonymousVotesChange}
                onTitleBlur={handleTitleBlur}
                onDescriptionBlur={handleDescriptionBlur}
              />

              {isAdmin && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Danger zone</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Reset all votes in this session. This action cannot be
                    undone.
                  </p>
                  <Button
                    onClick={handleResetVotes}
                    size="lg"
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Reset all votes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
