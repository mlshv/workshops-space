import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full text-base border border-border rounded px-3 py-1 hover:border-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'bg-foreground/5',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

