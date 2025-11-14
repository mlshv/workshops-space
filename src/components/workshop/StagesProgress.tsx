import {
  UsersThreeIcon,
  PencilIcon,
  CheckSquareIcon,
  ChartBarIcon,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { WorkshopStep } from '@/types/workshop'
import { cn } from '@/lib/utils'

type StagesProgressProps = {
  currentStep: WorkshopStep
  isAdmin?: boolean
  onStepClick?: (step: WorkshopStep) => void
}

type Stage = {
  id: WorkshopStep
  label: string
  icon: React.ComponentType<{
    size?: number
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill'
    className?: string
  }>
}

const stages: Stage[] = [
  {
    id: 'waiting',
    label: 'Waiting',
    icon: UsersThreeIcon,
  },
  {
    id: 'input',
    label: 'Ideas',
    icon: PencilIcon,
  },
  {
    id: 'voting',
    label: 'Vote',
    icon: CheckSquareIcon,
  },
  {
    id: 'results',
    label: 'Results',
    icon: ChartBarIcon,
  },
]

export function StagesProgress({ currentStep, isAdmin = false, onStepClick }: StagesProgressProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStep)

  const handleStageClick = (stage: Stage) => {
    if (isAdmin && onStepClick) {
      onStepClick(stage.id)
    }
  }

  return (
    <div className="flex items-center gap-1 select-none">
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isCurrent = index === currentIndex
        const isCompleted = index < currentIndex
        const isPending = index > currentIndex

        return (
          <div key={stage.id} className="flex items-center">
            <div
              className={cn(
                "group relative flex items-center",
                isAdmin && "cursor-pointer hover:opacity-70 transition-opacity"
              )}
              onClick={() => handleStageClick(stage)}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-6 h-6 flex items-center justify-center',
                  isPending && 'opacity-40',
                )}
                title={
                  stage.label +
                  (isCurrent ? ' (Current)' : isCompleted ? ' (Completed)' : '') +
                  (isAdmin ? ' (Click to navigate)' : '')
                }
              >
                <Icon className="w-full" weight="regular" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs whitespace-nowrap relative',
                  isPending && 'opacity-40',
                )}
              >
                {stage.label}
                {isCurrent && (
                  <motion.div
                    layoutId="active-step-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[0.1rem] bg-current"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </span>
            </div>

            {/* Connector line */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'w-4 h-[0.05rem] ml-2 bg-current',
                  index < currentIndex ? 'opacity-100' : 'opacity-25',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
