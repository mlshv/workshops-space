import { AnimatePresence, motion } from 'motion/react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const checkboxInnerVariants = cva(
  'relative text-[1em] box-border p-0.5 rounded-[0.5em] border-[0.1em] size-[3em] transition-[background-color,scale] duration-200 ease-[cubic-bezier(0.165,0.84,0.44,1)] active:scale-90',
  {
    variants: {
      variant: {
        default: '',
        inverse: '',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        checked: true,
        className: 'bg-foreground border-foreground',
      },
      {
        variant: 'default',
        checked: false,
        className: 'bg-foreground/5 border-foreground/20 hover:bg-foreground/10',
      },
      {
        variant: 'inverse',
        checked: true,
        className: 'bg-background border-background',
      },
      {
        variant: 'inverse',
        checked: false,
        className: 'bg-background/5 border-background/20 hover:bg-background/10',
      },
    ],
  },
)

type CheckboxProps = {
  id?: string
  value?: boolean
  className?: string
  onChange?: (value: boolean) => void
  color?: string
  duration?: number
  checkSymbol?: 'check' | 'cross'
  size?: 'base' | 'xl'
  variant?: 'default' | 'inverse'
}

export const Checkbox = ({
  id,
  value = false,
  className,
  onChange,
  color,
  duration,
  checkSymbol = 'check',
  size = 'base',
  variant = 'default',
}: CheckboxProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onChange) {
      onChange(!value)
    }
  }

  return (
    <button
      role="checkbox"
      className={cn(
        'inline-block select-none m-0 p-0 bg-transparent border-0 cursor-pointer',
        {
          'text-[2rem] sm:text-[3.5rem]': size === 'xl',
          'text-[0.5rem]': size === 'base',
        },
        className,
      )}
      aria-checked={value}
      onClick={handleClick}
      type="button"
    >
      <div
        className={checkboxInnerVariants({ variant, checked: value })}
        style={
          color && value
            ? {
                backgroundColor: color,
                borderColor: color,
              }
            : color && !value
              ? {
                  borderColor: `${color}66`,
                }
              : undefined
        }
      >
        <svg
          className={cn(
            'absolute transition-all ease-[cubic-bezier(0.165,0.84,0.44,1)] top-[0.5em] left-[0.5em] size-[2em]',
            variant === 'inverse' ? 'text-foreground' : 'text-background',
            value ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
          )}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transitionDuration: `${duration}ms`,
          }}
        >
          <AnimatePresence initial={false}>
            {checkSymbol === 'check' ? (
              <motion.g
                key="check"
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                initial={{ opacity: 0, scale: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <path
                  d="M 1 6.863 l 4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'transition-all ease-[cubic-bezier(0.165,0.84,0.44,1)]',
                    value ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:17]',
                  )}
                  style={{
                    strokeDasharray: '17',
                    transitionDuration: `${duration}ms`,
                  }}
                />
              </motion.g>
            ) : (
              <motion.g
                key="cross"
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <path
                  d="M 2 2 L 12 12 M 2 12 L 12 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    'transition-all ease-[cubic-bezier(0.165,0.84,0.44,1)]',
                    value ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:17]',
                  )}
                  style={{
                    strokeDasharray: '17',
                    transitionDuration: `${duration}ms`,
                  }}
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    </button>
  )
}
