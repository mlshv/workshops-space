import { authClient } from '@/lib/auth-client'
import { userFromSession } from '@/lib/user'
import { useMemo, useRef, useCallback } from 'react'
import type { User } from '@/types/workshop'

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession()
  const previousUserIdRef = useRef<string | null>(null)

  const user: User | null = useMemo(() => {
    if (!session?.user) return null
    const u = userFromSession(session)
    previousUserIdRef.current = u.id
    return u
  }, [session])

  const signInWithGoogle = useCallback(() => {
    return authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })
  }, [])

  const signInAnonymous = useCallback(() => {
    return authClient.signIn.anonymous()
  }, [])

  const signOut = useCallback(() => {
    return authClient.signOut()
  }, [])

  const isAuthenticated = !!session?.user && !session.user.isAnonymous
  const isAnonymous = !!session?.user?.isAnonymous

  return {
    user,
    session,
    isPending,
    error,
    isAuthenticated,
    isAnonymous,
    signInWithGoogle,
    signInAnonymous,
    signOut,
    previousUserId: previousUserIdRef.current,
  }
}
