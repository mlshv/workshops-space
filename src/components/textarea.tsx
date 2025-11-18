import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full border border-border rounded px-3 py-1 hover:border-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]',
          'bg-foreground/5',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

