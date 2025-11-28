import { createPortal } from 'react-dom'
import { defaultDropAnimationSideEffects, DragOverlay } from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const dropAnimationConfig: DropAnimation = {
  duration: 250,
  easing:
    'linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1)',
  keyframes({ transform, ...rest }) {
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      { transform: CSS.Transform.toString(transform.final) },
    ]
  },
  sideEffects: defaultDropAnimationSideEffects({
    className: {
      active: 'opacity-0',
    },
  }),
}

interface Props {
  children: React.ReactNode
  dropAnimation?: DropAnimation | null
}

export function DraggableOverlay({
  children,
  dropAnimation = dropAnimationConfig,
}: Props) {
  return createPortal(
    <DragOverlay dropAnimation={dropAnimation} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {children}
    </DragOverlay>,
    document.body,
  )
}
