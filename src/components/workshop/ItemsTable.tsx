import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import {
  CaretUpIcon,
  CaretDownIcon,
  CheckIcon,
  CaretUpDownIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react'
import { Select } from '@base-ui-components/react/select'
import type {
  Card,
  RoomState,
  Vote as VoteType,
  NextAction as NextActionType,
} from '@/types/workshop'
import type { AggregatedScore } from '@/lib/aggregateVotes'
import { toFixed } from '@/lib/to-fixed'
import { UserAvatar } from './UserAvatar'
import { cn } from '@/lib/utils'
import type { RoomConnection } from '@/lib/partykit'
import { CardDetailsModal } from './CardDetailsModal'

type ItemsTableProps = {
  positions: Array<{
    card: Card
    aggregated: AggregatedScore
  }>
  room: RoomState
  connection: RoomConnection
}

type TableRow = {
  title: string
  postedBy: string
  importance: number
  complexity: number
  votes: VoteType[]
  aggregated: AggregatedScore
  cardId: string
  authorColor: string // Card background color (pale)
  avatarColor: string // Avatar color (dark)
}

const nextActionOptions = [
  { label: 'Select action', value: null, disabled: true },
  { label: 'Do now', value: 'do-now', disabled: false },
  { label: 'Do next', value: 'do-next', disabled: false },
  { label: 'Postpone', value: 'postpone', disabled: false },
  { label: "Don't do", value: 'dont-do', disabled: false },
] as const

const columnHelper = createColumnHelper<TableRow>()

// Define columns outside component to prevent recreation
const createColumns = (
  room: RoomState,
  connection: RoomConnection,
  onTextClick: (cardId: string) => void,
) => {
  const columns: ColumnDef<TableRow, any>[] = [
    columnHelper.accessor('title', {
      header: 'Text',
      cell: (info) => (
        <div
          className="text-ellipsis overflow-hidden whitespace-nowrap max-w-40 clickable hover:opacity-60"
          onClick={() => onTextClick(info.row.original.cardId)}
        >
          {info.getValue()}
        </div>
      ),
      enableSorting: false,
    }),
  ]

  // Only show "Posted by" column if anonymousCards is not enabled
  if (!room.anonymousCards) {
    columns.push(
      columnHelper.accessor('postedBy', {
        header: 'Posted by',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <UserAvatar name={info.getValue()} color={info.row.original.avatarColor} size="sm" />
            <span>{info.getValue()}</span>
          </div>
        ),
        enableSorting: true,
      }),
    )
  }

  columns.push(
    columnHelper.accessor('importance', {
      header: 'Importance',
      cell: (info) => toFixed(info.getValue(), 1),
      enableSorting: true,
    }),
    columnHelper.accessor('complexity', {
      header: 'Complexity',
      cell: (info) => toFixed(info.getValue(), 1),
      enableSorting: true,
    }),
    columnHelper.display({
      id: 'nextAction',
      header: 'Next action',
      cell: (info) => {
        const cardId = info.row.original.cardId
        const card = room.cards.find((c) => c.id === cardId)
        const currentAction = card?.nextAction || null

        return (
          <Select.Root
            items={nextActionOptions}
            value={currentAction}
            onValueChange={(value) =>
              connection.setNextAction(cardId, value as NextActionType)
            }
          >
            <Select.Trigger className="flex w-40 items-center justify-between gap-2 px-3 py-1.5 text-sm bg-white border border-border rounded hover:border-foreground focus:outline-none focus-visible:ring-2 focus:ring-primary focus-visible:border-transparent cursor-pointer">
              <Select.Value />
              <Select.Icon>
                <CaretUpDownIcon size={16} className="text-muted-foreground" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner sideOffset={4}>
                <Select.Popup className="bg-white border border-border rounded shadow-lg py-1 z-50">
                  <Select.List>
                    {nextActionOptions.map(({ label, value, disabled }) => (
                      <Select.Item
                        key={String(value)}
                        value={value}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm outline-none cursor-default',
                          !disabled && 'hover:bg-gray-100 cursor-pointer',
                        )}
                        disabled={disabled}
                      >
                        {!disabled && (
                          <Select.ItemIndicator className="w-4 h-4 flex items-center justify-center">
                            <CheckIcon size={16} weight="bold" />
                          </Select.ItemIndicator>
                        )}
                        <Select.ItemText className={cn(disabled && 'opacity-50')}>
                          {label}
                        </Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        )
      },
    }),
  )

  return columns
}

export function ItemsTable({ positions, room, connection }: ItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const handleTextClick = (cardId: string) => {
    setSelectedCardId(cardId)
  }

  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['Text', 'Posted by', 'Importance', 'Complexity', 'Next action']

    // Create CSV rows
    const rows = data.map((row) => {
      const card = room.cards.find((c) => c.id === row.cardId)
      const nextAction = card?.nextAction || ''
      const nextActionLabel = nextActionOptions.find((opt) => opt.value === nextAction)?.label || ''

      return [
        `"${row.title.replace(/"/g, '""')}"`, // Escape quotes in text
        row.postedBy,
        toFixed(row.importance, 1),
        toFixed(row.complexity, 1),
        nextActionLabel,
      ].join(',')
    })

    // Combine header and rows
    const csv = [headers.join(','), ...rows].join('\n')

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `workshop-results-${room.id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Memoize transformed data to prevent unnecessary re-renders
  const data = useMemo<TableRow[]>(
    () =>
      positions.map((pos) => {
        const author = room.users.find((p) => p.id === pos.card.authorId)
        const defaultColor = 'var(--color-sticky-note-yellow)'

        return {
          title: pos.card.text,
          postedBy: author?.name || 'Unknown',
          importance: pos.aggregated.importance,
          complexity: pos.aggregated.complexity,
          votes: pos.card.votes,
          aggregated: pos.aggregated,
          cardId: pos.card.id,
          authorColor: room.anonymousCards ? defaultColor : (author?.cardColor || defaultColor),
          avatarColor: room.anonymousCards ? defaultColor : (author?.color || defaultColor),
        }
      }),
    [positions, room.users, room.anonymousVotes, room.anonymousCards],
  )

  const columns = useMemo(
    () => createColumns(room, connection, handleTextClick),
    [room, connection],
  )

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null
    return positions.find((pos) => pos.card.id === selectedCardId)
  }, [selectedCardId, positions])

  const selectedCardData = useMemo(() => {
    if (!selectedCard) return null
    return data.find((row) => row.cardId === selectedCardId)
  }, [selectedCard, selectedCardId, data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">All Items</h3>
      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-foreground/5 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xs font-medium"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            'flex items-center gap-2 cursor-pointer select-none hover:opacity-60',
                          'whitespace-nowrap',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            {header.column.getIsSorted() === 'asc' ? (
                              <CaretUpIcon size={16} weight="fill" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <CaretDownIcon size={16} weight="fill" />
                            ) : (
                              <span className="text-muted-foreground">
                                <CaretUpIcon size={16} />
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border hover:bg-foreground/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-1 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-foreground/5 border-t border-border">
            <tr>
              <td colSpan={table.getAllColumns().length} className="px-2">
                <div className="flex justify-end">
                  <button
                    onClick={handleExportCSV}
                    className="p-1.5 text-foreground/50 hover:text-foreground clickable"
                    title="Export to CSV"
                  >
                    <DownloadSimpleIcon className="size-4" weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {selectedCard && selectedCardData && (
        <CardDetailsModal
          open={selectedCardId !== null}
          onOpenChange={(open) => !open && setSelectedCardId(null)}
          text={selectedCard.card.text}
          authorColor={selectedCardData.authorColor}
          anonymousVotes={room.anonymousVotes}
          voteData={{
            votes: selectedCard.card.votes,
            users: room.users,
            aggregated: selectedCard.aggregated,
          }}
        />
      )}
    </div>
  )
}
