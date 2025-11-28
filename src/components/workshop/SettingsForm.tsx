import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Checkbox } from '@/components/checkbox'

type SettingsFormProps = {
  title: string
  description: string
  anonymousVotes?: boolean
  anonymousCards?: boolean
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onAnonymousVotesChange?: (value: boolean) => void
  onAnonymousCardsChange?: (value: boolean) => void
  onTitleBlur?: () => void
  onDescriptionBlur?: () => void
}

export function SettingsForm({
  title,
  description,
  anonymousVotes = false,
  anonymousCards = false,
  onTitleChange,
  onDescriptionChange,
  onAnonymousVotesChange,
  onAnonymousCardsChange,
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

      <div className="space-y-3">
        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => onAnonymousVotesChange?.(!anonymousVotes)}
        >
          <Checkbox
            id="anonymous-votes"
            value={anonymousVotes}
            onChange={onAnonymousVotesChange}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <label className="cursor-pointer select-none leading-none font-medium" htmlFor="anonymous-votes">
              Anonymous votes
            </label>
            <p className="text-xs text-muted-foreground">
              Hide voter names in results
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => onAnonymousCardsChange?.(!anonymousCards)}
        >
          <Checkbox
            id="anonymous-cards"
            value={anonymousCards}
            onChange={onAnonymousCardsChange}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <label className="cursor-pointer select-none leading-none font-medium" htmlFor="anonymous-cards">
              Anonymous ideas
            </label>
            <p className="text-xs text-muted-foreground">
              Hide card authors
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
