import { useAuth } from '@/hooks/useAuth'
import { SignOutIcon } from '@phosphor-icons/react'
import { Button } from '@/components/button'

export function UserMenu() {
  const { user, isAuthenticated, signOut } = useAuth()
  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="size-7 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="size-7 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium">{user.name}</span>
      {isAuthenticated && (
        <Button variant="inverse" size="sm" onClick={() => signOut()}>
          <SignOutIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}
