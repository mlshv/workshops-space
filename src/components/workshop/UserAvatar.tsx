import { getColorFromName, getInitial } from '@/lib/avatar'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  name: string
  size?: 'sm' | 'base'
  className?: string
}

export function UserAvatar({ name, size = 'base', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    base: 'w-8 h-8 text-lg',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: getColorFromName(name) }}
    >
      {getInitial(name)}
    </div>
  )
}
