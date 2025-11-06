import { useDroppable } from '@dnd-kit/core'
import { forwardRef, type ReactNode } from 'react'

type MatrixLayoutProps = {
  children: ReactNode
}

export const MATRIX_LAYOUT_DROPPABLE_ID = 'matrix-layout'

export const MatrixLayout = forwardRef<HTMLDivElement, MatrixLayoutProps>(
  ({ children }, ref) => {
    const { setNodeRef } = useDroppable({
      id: MATRIX_LAYOUT_DROPPABLE_ID,
    })

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(node)
            } else {
              ref.current = node
            }
          }
          setNodeRef(node)
        }}
        className="w-full h-full flex-1 relative border border-gray-300 bg-gray-50"
      >
        {/* Cross lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 pointer-events-none" />
        <div className="absolute left-0 top-1/2 w-full h-px bg-gray-300 pointer-events-none" />

        {/* Axis labels */}
        {/* Y-axis (vertical) - Importance */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold bg-gray-50 px-1 pointer-events-none">
          Important
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold bg-gray-50 px-1 pointer-events-none">
          Unimportant
        </div>

        {/* X-axis (horizontal) - Complexity */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold bg-gray-50 px-1 pointer-events-none">
          Simple
        </div>
        <div className="absolute right-2 bottom-1/2 translate-y-1/2 text-xs font-semibold bg-gray-50 px-1 pointer-events-none">
          Complex
        </div>

        {children}
      </div>
    )
  },
)

MatrixLayout.displayName = 'MatrixLayout'
