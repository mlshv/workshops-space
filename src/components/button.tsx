import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SmallAppleSpinner } from './small-apple-spinner'
import { cva, VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'relative text-sm rounded leading-[0.75rem] font-medium',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background',
        inverse: 'bg-background text-foreground border border-border',
        tile: 'bg-transparent border hover:bg-foreground/5',
      },
      size: {
        default: 'px-3 py-2',
        lg: 'px-4 py-1 text-lg',
      },
      disabled: {
        true: 'bg-foreground/50 cursor-not-allowed',
        false: 'hover:opacity-90 clickable',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
)

function Button({
  isPending: isPendingProp,
  className,
  variant = 'default',
  size = 'default',
  disabled,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onClick'> &
  VariantProps<typeof buttonVariants> & {
    isPending?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any> | void
  }) {
  const [isPending, setIsPending] = useState(false)

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending || isPendingProp) return
    const result = props.onClick?.(e)
    if (result instanceof Promise) {
      setIsPending(true)
      return result.finally(() => {
        setIsPending(false)
      })
    }
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ disabled, variant, size }), className)}
      {...props}
      disabled={disabled}
      onClick={onClick}
    >
      {(isPending || isPendingProp) && (
        <div className="absolute bg-inherit inset-1 flex items-center justify-center">
          <SmallAppleSpinner
            className={cn(size === 'lg' ? 'size-6' : 'size-4')}
          />
        </div>
      )}
      {props.children}
    </button>
  )
}

export { Button }
