// import { useRef, useState } from 'react'
// import {
//   DndContext,
//   useSensor,
//   useSensors,
//   PointerSensor,
//   DragEndEvent,
//   useDraggable,
//   useDroppable,
//   DragOverlay,
//   type DropAnimation,
//   DragMoveEvent,
// } from '@dnd-kit/core'
// import { CSS } from '@dnd-kit/utilities'
// import type { RoomState, User, Vote, Quadrant } from '@/types/workshop'
// import { MatrixLayout } from './MatrixLayout'
// import { MatrixCard } from './MatrixCard'
// import { cn } from '@/lib/utils'
// import { restrictToWindowEdges } from '@dnd-kit/modifiers'

// const dropAnimationConfig: DropAnimation = {
//   keyframes({ transform }) {
//     return [
//       { transform: CSS.Transform.toString(transform.initial) },
//       {
//         transform: CSS.Transform.toString({
//           ...transform.final,
//         }),
//       },
//     ]
//   },
// }

// type VotingMatrixProps = {
//   room: RoomState
//   currentUser: User
//   onVote: (vote: Vote) => void
// }

// export default function VotingMatrix({
//   room,
//   currentUser,
//   onVote,
// }: VotingMatrixProps) {
//   const [activeId, setActiveId] = useState<string | null>(null)
//   const [activeScore, setActiveScore] = useState<{ importance: number; complexity: number }>({ importance: 1, complexity: 1 })
//   const matrixLayoutRef = useRef<HTMLDivElement>(null)

//   const [droppingId, setDroppingId] = useState<string | null>(null)
//   const [optimisticVotes, setOptimisticVotes] = useState<Map<string, Vote>>(
//     new Map(),
//   )

//   const sensors = useSensors(useSensor(PointerSensor))

//   // Merge optimistic votes with actual votes from the room state
//   const otherUsersCards = room.cards.filter(
//     (card) => card.authorId !== currentUser.id,
//   )
//   const cardsWithOptimisticVotes = otherUsersCards.map((card) => {
//     const optimisticVote = optimisticVotes.get(card.id)
//     if (optimisticVote) {
//       // replace existing vote or add new one
//       const votesWithoutCurrentUser = card.votes.filter(
//         (v) => v.userId !== currentUser.id,
//       )
//       return {
//         ...card,
//         votes: [...votesWithoutCurrentUser, optimisticVote],
//       }
//     }
//     return card
//   })

//   const availableCards = cardsWithOptimisticVotes.filter((card) => {
//     return !card.votes.some((vote) => vote.userId === currentUser.id)
//   })

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event
//     setActiveId(null)

//     if (over && typeof active.id === 'string') {
//       const quadrant = over.id as Quadrant
//       if (
//         quadrant === 'high-imp-simple' ||
//         quadrant === 'high-imp-complex' ||
//         quadrant === 'low-imp-simple' ||
//         quadrant === 'low-imp-complex'
//       ) {
//         setDroppingId(String(active.id))
//         const vote: Vote = {
//           userId: currentUser.id,
//           cardId: active.id,
//           quadrant,
//         }
//         // Optimistic update - add immediately to local state
//         setOptimisticVotes((prev) => {
//           const next = new Map(prev)
//           next.set(String(active.id), vote)
//           return next
//         })
//         // Send to server
//         onVote(vote)
//         // Clear dropping state after drop animation completes
//         setTimeout(() => {
//           setDroppingId(null)
//         }, 250)
//         // Clean up optimistic vote after a delay (server should have responded by then)
//         setTimeout(() => {
//           setOptimisticVotes((prev) => {
//             const next = new Map(prev)
//             next.delete(String(active.id))
//             return next
//           })
//         }, 1000)
//       }
//     }
//   }

//   const handleDragMove = (event: DragMoveEvent) => {
//     const matrixLayout = matrixLayoutRef.current?.getBoundingClientRect()
//     const rect = event.active.rect.current.translated
//     console.log({event, rect })
//     if (rect && matrixLayout) {
//       const importance = 1 - (rect.top / matrixLayout.height)
//       const complexity = rect.left / matrixLayout.width
//       setActiveScore({ importance, complexity })
//     }
//   }

//   return (
//     <div className="flex-1 p-6 flex flex gap-4">
//       <DndContext
//         modifiers={[restrictToWindowEdges]}
//         sensors={sensors}
//         onDragStart={(event) => {
//           if (typeof event.active.id === 'string') {
//             setActiveId(event.active.id)
//           }
//         }}
//         onDragMove={handleDragMove}
//         onDragEnd={handleDragEnd}
//       >
//         <MatrixLayout ref={matrixLayoutRef}>
//           <QuadrantDropZone
//             id="high-imp-simple"
//             cards={cardsWithOptimisticVotes.filter((card) => {
//               const userVote = card.votes.find(
//                 (v) => v.userId === currentUser.id,
//               )
//               return userVote?.quadrant === 'high-imp-simple'
//             })}
//             position="top-left"
//             droppingId={droppingId}
//           />
//           <QuadrantDropZone
//             id="high-imp-complex"
//             cards={cardsWithOptimisticVotes.filter((card) => {
//               const userVote = card.votes.find(
//                 (v) => v.userId === currentUser.id,
//               )
//               return userVote?.quadrant === 'high-imp-complex'
//             })}
//             position="top-right"
//             droppingId={droppingId}
//           />
//           <QuadrantDropZone
//             id="low-imp-simple"
//             cards={cardsWithOptimisticVotes.filter((card) => {
//               const userVote = card.votes.find(
//                 (v) => v.userId === currentUser.id,
//               )
//               return userVote?.quadrant === 'low-imp-simple'
//             })}
//             position="bottom-left"
//             droppingId={droppingId}
//           />
//           <QuadrantDropZone
//             id="low-imp-complex"
//             cards={cardsWithOptimisticVotes.filter((card) => {
//               const userVote = card.votes.find(
//                 (v) => v.userId === currentUser.id,
//               )
//               return userVote?.quadrant === 'low-imp-complex'
//             })}
//             position="bottom-right"
//             droppingId={droppingId}
//           />
//         </MatrixLayout>

//         <div className="w-[16vw] py-2 px-5 flex flex-col items-center border border-gray-300">
//           <h3 className="font-semibold mb-4 text-center">
//             Drag cards to the matrix
//           </h3>
//           <div className="flex flex-col gap-2 justify-center">
//             {availableCards.map((card) => (
//               <DraggableCard
//                 key={card.id}
//                 card={card}
//                 droppingId={droppingId}
//               />
//             ))}
//           </div>
//           {availableCards.length === 0 && (
//             <p className="text-gray-600 text-sm">
//               All cards have been voted on
//             </p>
//           )}
//         </div>

//         <DragOverlay dropAnimation={dropAnimationConfig}>
//           {activeId ? (
//             <MatrixCard
//               key={activeId}
//               text={
//                 cardsWithOptimisticVotes.find((c) => c.id === activeId)?.text ||
//                 ''
//               }
//               score={{
//                 importance: Number(activeScore.importance.toFixed(4)),
//                 complexity: Number(activeScore.complexity.toFixed(4)),
//               }}
//               className="cursor-move"
//             />
//           ) : null}
//         </DragOverlay>
//       </DndContext>
//     </div>
//   )
// }

// type QuadrantDropZoneProps = {
//   id: Quadrant
//   cards: Array<{ id: string; text: string }>
//   position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
//   droppingId: string | null
// }

// function QuadrantDropZone({
//   id,
//   cards,
//   position,
//   droppingId,
// }: QuadrantDropZoneProps) {
//   const { setNodeRef, isOver } = useDroppable({
//     id,
//   })

//   const positionClasses = {
//     'top-left': 'top-0 left-0 bottom-1/2 right-1/2',
//     'top-right': 'top-0 right-0 bottom-1/2 left-1/2',
//     'bottom-left': 'bottom-0 left-0 top-1/2 right-1/2',
//     'bottom-right': 'bottom-0 right-0 top-1/2 left-1/2',
//   }

//   return (
//     <div
//       ref={setNodeRef}
//       className={cn(
//         'absolute',
//         positionClasses[position],
//         'p-8 pt-10',
//         isOver && 'bg-blue-100/50',
//       )}
//     >
//       {cards.map((card) => (
//         <DraggableCard key={card.id} card={card} droppingId={droppingId} />
//       ))}
//     </div>
//   )
// }

// type DraggableCardProps = {
//   card: { id: string; text: string }
//   droppingId: string | null
// }

// function DraggableCard({ card, droppingId }: DraggableCardProps) {
//   const { attributes, listeners, setNodeRef, transform, isDragging } =
//     useDraggable({
//       id: card.id,
//     })

//   const style = transform
//     ? {
//         transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
//       }
//     : undefined

//   const isInvisible = isDragging || card.id === droppingId

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...listeners}
//       {...attributes}
//       className={cn('cursor-move', isInvisible && 'opacity-0')}
//     >
//       <MatrixCard text={card.text} />
//     </div>
//   )
// }
