import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Checkbox } from '@/components/checkbox'

type SettingsFormProps = {
  title: string
  description: string
  anonymousVotes?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onAnonymousVotesChange?: (value: boolean) => void
  onTitleBlur?: () => void
  onDescriptionBlur?: () => void
}

export function SettingsForm({
  title,
  description,
  anonymousVotes = false,
  onTitleChange,
  onDescriptionChange,
  onAnonymousVotesChange,
  onTitleBlur,
  onDescriptionBlur,
}: SettingsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="workshop-title" className="block pb-1 font-medium">
          Title
        </label>
        <Input
          id="workshop-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          onBlur={onTitleBlur}
        />
      </div>

      <div>
        <label htmlFor="workshop-description" className="block pb-1 font-medium">
          Description
        </label>
        <Textarea
          id="workshop-description"
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          onBlur={onDescriptionBlur}
        />
      </div>

      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onAnonymousVotesChange?.(!anonymousVotes)}
      >
        <Checkbox
          id="anonymous-votes"
          value={anonymousVotes}
          onChange={onAnonymousVotesChange}
        />
        <label className="font-medium cursor-pointer select-none" htmlFor="anonymous-votes">
          Anonymous votes
        </label>
      </div>
    </div>
  )
}
