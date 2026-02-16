import { GoogleLogoIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/button'

export function SignInButton() {
  const { signInWithGoogle } = useAuth()

  return (
    <Button
      onClick={signInWithGoogle}
      variant="inverse"
      className="gap-2 flex items-center"
    >
      <GoogleLogoIcon className="size-4" weight="bold" />
      Sign in with Google
    </Button>
  )
}
